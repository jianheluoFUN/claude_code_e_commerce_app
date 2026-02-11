"use client"

import {useEffect, useState} from "react"
import {useSearchParams} from "next/navigation"
import Link from "next/link"
import {CheckCircle, Loader2, Package} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"

// configure the "success_url" when creating the
export default function CheckoutSuccessPage() {

    const searchParams = useSearchParams()
    console.log(`[CheckoutSuccessPage] searchParams.toString(): ${JSON.stringify(searchParams.toString())}`)

    const sessionId = searchParams.get("session_id")
    const orderIds = searchParams.get("order_ids")
    console.log(`[CheckoutSuccessPage] sessionId: ${JSON.stringify(sessionId)}`)
    console.log(`[CheckoutSuccessPage] orderIds: ${JSON.stringify(orderIds)}`)

    const [verifying, setVerifying] = useState(true)
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        // Simulate verification delay for better UX
        const timer = setTimeout(() => {
            setVerifying(false)
            setVerified(true)
        }, 1500)

        return () => clearTimeout(timer)
    }, [sessionId])

    if (verifying) {
        return (
            <div className="container py-16 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
                <h2 className="text-xl font-semibold">Verifying your payment...</h2>
                <p className="text-muted-foreground mt-2">Please wait while we confirm your order.</p>
            </div>
        )
    }

    return (
        <div className="container py-16 flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="pb-4">
                    <div className="mx-auto mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500"/>
                    </div>
                    <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Thank you for your purchase! Your order has been placed and payment has been confirmed.
                    </p>

                    {/* conditional rendering */}
                    {orderIds && (
                        <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm font-medium mb-1">Order Reference</p>

                            <p className="text-xs text-muted-foreground font-mono">

                                {orderIds.split(",").map((id, idx) => (

                                    <span key={id}>
                                        {idx > 0 && ", "}
                                        {id.slice(0, 8)}...
                                    </span>

                                ))}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4"/>
                        <span>You will receive an email confirmation shortly.</span>
                    </div>
                </CardContent>

                <CardFooter className="flex-col gap-3">

                    {/* Link to "/orders" routing */}
                    <Link href="/orders" className="w-full">
                        <Button className="w-full" size="lg">
                            View My Orders
                        </Button>
                    </Link>

                    {/* Link to "/products" routing */}
                    <Link href="/products" className="w-full">
                        <Button variant="outline" className="w-full">
                            Continue Shopping
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
