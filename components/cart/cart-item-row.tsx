"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/types"

interface CartItemRowProps {
  item: CartItem & {
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

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateQuantity = async (newQuantity: number) => {
    if (!item.product) return
    setLoading(true)

    const supabase = createClient()

    if (newQuantity <= 0) {
      await supabase.from("cart_items").delete().eq("id", item.id)
    } else if (newQuantity <= item.product.inventory_count) {
      await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", item.id)
    }

    setLoading(false)
    router.refresh()
  }

  const removeItem = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from("cart_items").delete().eq("id", item.id)
    setLoading(false)
    router.refresh()
  }

  if (!item.product) return null

  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      <div className="h-24 w-24 bg-muted rounded-md overflow-hidden relative shrink-0">
        {item.product.images && item.product.images.length > 0 ? (
          <Image
            src={item.product.images[0]}
            alt={item.product.name}
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
          href={`/products/${item.product.slug}`}
          className="font-medium hover:text-primary transition-colors line-clamp-2"
        >
          {item.product.name}
        </Link>
        <p className="text-lg font-semibold mt-1">{formatPrice(item.product.price)}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.quantity - 1)}
              disabled={loading}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.quantity + 1)}
              disabled={loading || item.quantity >= item.product.inventory_count}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={removeItem}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          {formatPrice(item.product.price * item.quantity)}
        </p>
      </div>
    </div>
  )
}
