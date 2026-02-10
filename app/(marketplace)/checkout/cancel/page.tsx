"use client"

import Link from "next/link"
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutCancelPage() {
  return (
    <div className="container py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment was cancelled. Don&apos;t worry - no charges were made to your account.
          </p>

          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm">
              Your items are still in your cart. You can try again whenever you&apos;re ready.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Need help? Contact our support team.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Link href="/cart" className="w-full">
            <Button className="w-full" size="lg">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Return to Cart
            </Button>
          </Link>
          <Link href="/checkout" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Checkout Again
            </Button>
          </Link>
          <Link href="/products" className="w-full">
            <Button variant="ghost" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
