"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {Minus, Plus, Trash2, Loader2} from "lucide-react"
import {createClient} from "@/lib/supabase/client"
import {formatPrice} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import type {CartItem} from "@/lib/types"

interface CartItemRowProps {
    cartItem: CartItem & {
        product: {
            id: string
            name: string
            slug: string
            price: number
            images: string[]
            inventory_count: number
        } | null
    }
}

// This is the component for each cart item in the cart page
export function CartItemRow(
    {
        cartItem
    }: CartItemRowProps
) {
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    // callback handler function is triggered whenever the cart item quantity is updated
    const updateQuantity = async (
        newQuantity: number
    ) => {

        if (!cartItem.product) {
            return
        }

        setLoading(true)

        const supabase = createClient()

        if (newQuantity <= 0) {

            // update "cart_items" table
            await supabase
                .from("cart_items")
                .delete()
                .eq("id", cartItem.id)
        } else if (newQuantity <= cartItem.product.inventory_count) {

            // update "cart_items" table
            await supabase
                .from("cart_items")
                .update({quantity: newQuantity})
                .eq("id", cartItem.id)
        }

        setLoading(false)
        router.refresh()
    }

    // callback handler function is triggered whenever the cart item is removed
    const removeItem = async () => {
        setLoading(true)
        const supabase = createClient()

        // update "cart_items" table to remove the cart item based on the "id"
        await supabase
            .from("cart_items")
            .delete()
            .eq("id", cartItem.id)

        setLoading(false)
        router.refresh()
    }

    if (!cartItem.product) {
        return null
    }

    return (
        <div className="flex gap-4 py-4 border-b last:border-0">
            <div className="h-24 w-24 bg-muted rounded-md overflow-hidden relative shrink-0">
                {/* conditional rendering */}
                {cartItem.product.images && cartItem.product.images.length > 0 ? (
                    <Image
                        src={cartItem.product.images[0]}
                        alt={cartItem.product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                    </div>
                )}
            </div>

            <div className="flex-1">
                {/* Link to "/products/<product_slug>" routing */}
                <Link
                    href={`/products/${cartItem.product.slug}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                    {cartItem.product.name}
                </Link>

                <p className="text-lg font-semibold mt-1">
                    {formatPrice(cartItem.product.price)}
                </p>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md">

                        {/* Button to decrement the cart item quantity */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(cartItem.quantity - 1)}
                            disabled={loading}
                        >
                            <Minus className="h-4 w-4"/>
                        </Button>

                        <span className="w-8 text-center text-sm">{cartItem.quantity}</span>

                        {/* Button to increment the cart item quantity */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(cartItem.quantity + 1)}
                            disabled={loading || cartItem.quantity >= cartItem.product.inventory_count}
                        >
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>

                    {/* Button to remove the cart item */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={removeItem}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            <Trash2 className="h-4 w-4"/>
                        )}
                    </Button>
                </div>
            </div>

            <div className="text-right">
                <p className="font-semibold">
                    {formatPrice(cartItem.product.price * cartItem.quantity)}
                </p>
            </div>
        </div>
    )
}
