"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {Minus, Plus, ShoppingCart, Loader2} from "lucide-react"
import {createClient} from "@/lib/supabase/client"
import {Button} from "@/components/ui/button"
import type {Product} from "@/lib/types"

interface AddToCartButtonProps {
    product: Product
}

// This is the component to add to shopping cart
export function AddToCartButton(
    {
        product
    }: AddToCartButtonProps
) {

    const router = useRouter()
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAddToCart = async () => {
        setLoading(true)
        setError(null)

        const supabase = createClient()

        // Check if user is logged in
        const {data: {user}} = await supabase.auth.getUser()

        if (!user) {
            router.push(`/login?redirect=/products/${product.slug}`)
            return
        }

        // Check if item already in cart
        const {data: existingItem} = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("buyer_id", user.id)
            .eq("product_id", product.id)
            .single()

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity
            if (newQuantity > product.inventory_count) {
                setError("Not enough stock available")
                setLoading(false)
                return
            }

            const {error: updateError} = await supabase
                .from("cart_items")
                .update({quantity: newQuantity})
                .eq("id", existingItem.id)

            if (updateError) {
                setError(updateError.message)
                setLoading(false)
                return
            }
        } else {
            // Add new item
            const {error: insertError} = await supabase
                .from("cart_items")
                .insert({
                    buyer_id: user.id,
                    product_id: product.id,
                    quantity,
                })

            if (insertError) {
                setError(insertError.message)
                setLoading(false)
                return
            }
        }

        setLoading(false)
        router.refresh()
        // Could add a toast notification here
    }

    const isOutOfStock = product.inventory_count === 0

    return (
        <div className="space-y-4">
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                    >
                        <Minus className="h-4 w-4"/>
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.inventory_count, quantity + 1))}
                        disabled={quantity >= product.inventory_count || isOutOfStock}
                    >
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>

                <Button
                    onClick={handleAddToCart}
                    disabled={loading || isOutOfStock}
                    className="flex-1 gap-2"
                    size="lg"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin"/>
                    ) : (
                        <ShoppingCart className="h-5 w-5"/>
                    )}
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
            </div>
        </div>
    )
}
