import {redirect} from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {ShoppingCart} from "lucide-react"
import {createClient} from "@/lib/supabase/server"
import {formatPrice} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {CartItemRow} from "@/components/cart/cart-item-row"

export default async function CartPage() {
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?redirect=/cart")
    }

    // Fetch cart items with product and store info
    const {data: cartItems} = await supabase
        .from("cart_items")
        .select(`
      *,
      product:products(
        id,
        name,
        slug,
        price,
        images,
        inventory_count,
        store:stores(name, slug)
      )
    `)
        .eq("buyer_id", user.id)
        .order("created_at", {ascending: false})

    // Group items by store
    const itemsByStore = cartItems?.reduce((acc, item) => {
        const storeId = item.product?.store?.slug || "unknown"
        if (!acc[storeId]) {
            acc[storeId] = {
                storeName: item.product?.store?.name || "Unknown Store",
                storeSlug: item.product?.store?.slug,
                items: [],
            }
        }
        acc[storeId].items.push(item)
        return acc
    }, {} as Record<string, { storeName: string; storeSlug?: string; items: typeof cartItems }>)

    // Calculate totals
    const subtotal = cartItems?.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity
    }, 0) || 0

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            {cartItems && cartItems.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">

                        {Object.entries(itemsByStore || {}).map(  ([storeSlug, storeData]) => {
                            const { storeName, items } = storeData as { storeName: string; storeSlug?: string; items: typeof cartItems }
                            return (
                                <Card key={storeSlug}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">
                                            <Link
                                                href={`/stores/${storeSlug}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {storeName}
                                            </Link>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {items?.map((item) => (
                                            <CartItemRow key={item.id} item={item}/>
                                        ))}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-muted-foreground">Calculated at checkout</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href="/checkout" className="w-full">
                                    <Button className="w-full" size="lg">
                                        Proceed to Checkout
                                    </Button>
                                </Link>
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
