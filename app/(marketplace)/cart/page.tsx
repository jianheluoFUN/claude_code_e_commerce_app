"use client"

import {useMemo} from "react"
import Image from "next/image"
import Link from "next/link"
import {ShoppingCart, Loader2, LogIn} from "lucide-react"
import {useCart} from "@/contexts/cart-context"
import {formatPrice} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import {CartItemRowClient} from "@/components/cart/cart-item-row-client"

// This is the page component for shopping cart
// The routing is "/cart"
// Now supports both guest (localStorage) and authenticated (database) users
export default function CartPage() {

    // retrieve cart information from global cart context
    const {
        items,
        itemCount,
        isLoading,
        isAuthenticated
    } = useCart()

    // Group items by store
    const itemsByStore = useMemo(() => {
        return items.reduce((acc, cartItem) => {
            const storeSlug = cartItem.product?.store?.slug || "unknown"
            const storeName = cartItem.product?.store?.name || "Unknown Store"

            if (!acc[storeSlug]) {
                acc[storeSlug] = {
                    storeName,
                    storeSlug,
                    items: []
                }
            }
            acc[storeSlug].items.push(cartItem)
            return acc
        }, {} as Record<string, { storeName: string; storeSlug: string; items: typeof items }>)
    }, [items])

    // Calculate totals
    const subtotal = useMemo(() => {
            return items.reduce((sum, item) => {
                return sum + (item.product?.price || 0) * item.quantity
            }, 0)
        },
        [items]
    )

    // conditional rendering
    if (isLoading) {
        return (
            <div className="container py-16 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4"/>
                <p className="text-muted-foreground">Loading your cart...</p>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                {!isAuthenticated && itemCount > 0 && (
                    <div className="text-sm text-muted-foreground">
                        Shopping as guest
                    </div>
                )}
            </div>

            {/* conditional rendering */}
            {items.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {
                            // By using the "Object.entries()" to iterate all records in "itemsByStore"
                            Object.entries(itemsByStore).map(
                                ([storeSlug, storeData]) => (
                                    <Card key={storeSlug}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg">
                                                <Link
                                                    href={`/stores/${storeSlug}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {storeData.storeName}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {storeData.items.map((item) => (
                                                <CartItemRowClient
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                {!isAuthenticated && (
                                    <CardDescription>
                                        Sign in to save your cart and checkout
                                    </CardDescription>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Items ({itemCount})
                                    </span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-muted-foreground">
                                        Calculated at checkout
                                    </span>
                                </div>

                                <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                            </CardContent>

                            <CardFooter className="flex-col gap-3">
                                {isAuthenticated ? (
                                    <Link href="/checkout" className="w-full">
                                        <Button className="w-full" size="lg">
                                            Proceed to Checkout
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login?redirect=/cart" className="w-full">
                                            <Button className="w-full" size="lg">
                                                <LogIn className="mr-2 h-4 w-4"/>
                                                Sign in to Checkout
                                            </Button>
                                        </Link>
                                        <p className="text-xs text-center text-muted-foreground">
                                            Your cart will be saved when you sign in
                                        </p>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground"/>
                    <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">
                        Looks like you haven&apos;t added anything to your cart yet.
                    </p>
                    <Link href="/products">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
