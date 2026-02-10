"use client"

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {Loader2, CreditCard, Lock} from "lucide-react"
import {createClient} from "@/lib/supabase/client"
import {formatPrice} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import type {CartItem, Product, Store} from "@/lib/types"


interface CartItemWithProduct extends CartItem {
    product: Product & { store: Store }
}

// This is the page component for checkout page
// The routing is "/checkout"
export default function CheckoutPage() {

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])

    // create a new state to keep track of the form data
    const [formData, setFormData] = useState(
        {
            full_name: "",
            address_line1: "",
            address_line2: "",
            city: "",
            state: "",
            postal_code: "",
            country: "US",
            phone: "",
        }
    )


    useEffect(
        () => {
            // define a new function to fetch cart items for the user
            const fetchCartItems = async () => {

                const supabase = createClient()

                const {
                    data: {
                        user
                    }
                } = await supabase.auth.getUser()

                if (!user) {
                    router.push("/login?redirect=/checkout")
                    return
                }

                // Fetch user profile for default name from "profiles" table
                const {data: profile} = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single()

                if (profile?.full_name) {
                    setFormData((prev) => (
                            {
                                ...prev,
                                full_name: profile.full_name
                            }
                        )
                    )
                }

                // Fetch cart items from DB
                // The query will be against following tables based on the user id:
                //      - "cart_items"
                //      - "products"
                //      - "stores"
                const {
                    data: items
                } = await supabase
                    .from("cart_items")
                    .select(`
                          *,
                          product:products(
                            *,
                            store:stores(*)
                          )
                        `
                    ).eq("buyer_id", user.id)

                if (!items || items.length === 0) {
                    // redirect to "/cart" routing
                    router.push("/cart")
                    return
                }

                // update state
                setCartItems(items as CartItemWithProduct[])

                // update state
                setLoading(false)
            }

            // call the async function without "await"
            fetchCartItems()
        },
        [router]
    )

    const subtotal = cartItems.reduce(
        (sum, item) => {
            return sum + (item.product?.price || 0) * item.quantity
        },
        0
    )

    // callback handler function
    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault()

        setSubmitting(true)
        setError(null)

        try {
            // Prepare items for Stripe checkout
            const items = cartItems.map(
                (item) => ({
                    productId: item.product_id,
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    image: item.product.images?.[0] || undefined,
                })
            )

            // Create Stripe checkout session
            // Make the POST request to the API route "/api/checkout"
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // The body contains the payload that will be sent to the Stripe
                body: JSON.stringify({
                    items: items,
                    shippingAddress: {
                        line1: formData.address_line1,
                        line2: formData.address_line2 || undefined,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.postal_code,
                        country: formData.country,
                        name: formData.full_name,
                        phone: formData.phone || undefined,
                    },
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session")
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                // By using rewrite the "window.location.href" to redirect
                window.location.href = data.url
            } else {
                throw new Error("No checkout URL received")
            }
        } catch (err) {
            console.error("Checkout error:", err)
            setError(err instanceof Error ? err.message : "An error occurred")
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="container py-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Shipping Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                                <CardDescription>
                                    Enter your shipping details. You&apos;ll be redirected to Stripe for secure payment.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) =>
                                                setFormData({...formData, full_name: e.target.value})
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({...formData, phone: e.target.value})
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line1">Address Line 1</Label>
                                    <Input
                                        id="address_line1"
                                        value={formData.address_line1}
                                        onChange={(e) =>
                                            setFormData({...formData, address_line1: e.target.value})
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                                    <Input
                                        id="address_line2"
                                        value={formData.address_line2}
                                        onChange={(e) =>
                                            setFormData({...formData, address_line2: e.target.value})
                                        }
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({...formData, city: e.target.value})
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State/Province</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) =>
                                                setFormData({...formData, state: e.target.value})
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="postal_code">Postal Code</Label>
                                        <Input
                                            id="postal_code"
                                            value={formData.postal_code}
                                            onChange={(e) =>
                                                setFormData({...formData, postal_code: e.target.value})
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <select
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) =>
                                                setFormData({...formData, country: e.target.value})
                                            }
                                            required
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="US">United States</option>
                                            <option value="CA">Canada</option>
                                            <option value="GB">United Kingdom</option>
                                            <option value="AU">Australia</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Info Card */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5"/>
                                    Payment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                    <Lock className="h-5 w-5 text-green-600"/>
                                    <div>
                                        <p className="font-medium">Secure Payment via Stripe</p>
                                        <p className="text-sm text-muted-foreground">
                                            You&apos;ll be redirected to Stripe&apos;s secure checkout to complete your
                                            payment.
                                            We accept all major credit cards.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div
                                            className="h-16 w-16 bg-muted rounded-md overflow-hidden relative shrink-0">
                                            {item.product?.images?.[0] && (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium line-clamp-1">
                                                {item.product?.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {formatPrice((item.product?.price || 0) * item.quantity)}
                                        </p>
                                    </div>
                                ))}

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                            Redirecting to Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-4 w-4"/>
                                            Pay with Stripe
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}
