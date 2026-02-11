"use client"

import {useState} from "react"
import {Minus, Plus, ShoppingCart, Loader2, Check} from "lucide-react"
import {useCart} from "@/contexts/cart-context"
import {Button} from "@/components/ui/button"
import type {Product} from "@/lib/types"

interface AddToCartButtonProps {
    product: Product
}

// This is the component to add to shopping cart
// Now works with both guest (localStorage) and authenticated (database) users
export function AddToCartButton({product}: AddToCartButtonProps) {
    const {addToCart, items} = useCart()
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    const [justAdded, setJustAdded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Check current quantity in cart
    const existingCartItem = items.find(item => item.productId === product.id)
    const currentCartQuantity = existingCartItem?.quantity || 0

    const handleAddToCart = async () => {
        setLoading(true)
        setError(null)

        // Check if adding this quantity would exceed stock
        if (currentCartQuantity + quantity > product.inventory_count) {
            setError("Not enough stock available")
            setLoading(false)
            return
        }

        try {
            await addToCart(product.id, quantity)
            setJustAdded(true)
            setQuantity(1) // Reset quantity after adding
            setTimeout(() => setJustAdded(false), 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add to cart")
        } finally {
            setLoading(false)
        }
    }

    const isOutOfStock = product.inventory_count === 0
    const maxQuantity = product.inventory_count - currentCartQuantity

    return (
        <div className="space-y-4">
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {currentCartQuantity > 0 && (
                <p className="text-sm text-muted-foreground">
                    {currentCartQuantity} already in your cart
                </p>
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
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity || isOutOfStock}
                    >
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>

                <Button
                    onClick={handleAddToCart}
                    disabled={loading || isOutOfStock || maxQuantity <= 0}
                    className="flex-1 gap-2"
                    size="lg"
                    variant={justAdded ? "secondary" : "default"}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin"/>
                            Adding...
                        </>
                    ) : justAdded ? (
                        <>
                            <Check className="h-5 w-5"/>
                            Added to Cart
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-5 w-5"/>
                            {isOutOfStock ? "Out of Stock" : maxQuantity <= 0 ? "Max in Cart" : "Add to Cart"}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
