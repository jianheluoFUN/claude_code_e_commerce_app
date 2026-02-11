"use client"

import {useState} from "react"
import Image from "next/image"
import Link from "next/link"
import {Minus, Plus, Trash2, Loader2} from "lucide-react"
import {useCart} from "@/contexts/cart-context"
import {formatPrice} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import type {Product} from "@/lib/types"

interface CartItemRowClientProps {
    item: {
        id: string
        productId: string
        quantity: number
        product?: Product
    }
}

// This is the component for each cart item in the cart page
// Works with both localStorage (guest) and database (authenticated) carts
export function CartItemRowClient({item}: CartItemRowClientProps) {
    const {updateQuantity, removeFromCart} = useCart()
    const [loading, setLoading] = useState(false)

    const handleUpdateQuantity = async (newQuantity: number) => {
        if (!item.product) return

        setLoading(true)
        try {
            await updateQuantity(item.productId, newQuantity)
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async () => {
        setLoading(true)
        try {
            await removeFromCart(item.productId)
        } finally {
            setLoading(false)
        }
    }

    if (!item.product) {
        return null
    }

    const product = item.product

    return (
        <div className="flex gap-4 py-4 border-b last:border-0">
            <div className="h-24 w-24 bg-muted rounded-md overflow-hidden relative shrink-0">
                {product.images && product.images.length > 0 ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
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
                <Link
                    href={`/products/${product.slug}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-2"
                >
                    {product.name}
                </Link>

                <p className="text-lg font-semibold mt-1">
                    {formatPrice(product.price)}
                </p>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.quantity - 1)}
                            disabled={loading}
                        >
                            <Minus className="h-4 w-4"/>
                        </Button>

                        <span className="w-8 text-center text-sm">{item.quantity}</span>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.quantity + 1)}
                            disabled={loading || item.quantity >= product.inventory_count}
                        >
                            <Plus className="h-4 w-4"/>
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={handleRemove}
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
                    {formatPrice(product.price * item.quantity)}
                </p>
            </div>
        </div>
    )
}
