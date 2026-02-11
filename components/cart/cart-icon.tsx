"use client"

import Link from "next/link"
import {ShoppingCart} from "lucide-react"
import {useCart} from "@/contexts/cart-context"
import {Button} from "@/components/ui/button"

// Cart icon component that shows the item count badge
// Works for both guest and authenticated users
export function CartIcon() {
    const {itemCount, isLoading} = useCart()

    return (
        <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5"/>
                {!isLoading && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                        {itemCount > 99 ? "99+" : itemCount}
                    </span>
                )}
            </Button>
        </Link>
    )
}
