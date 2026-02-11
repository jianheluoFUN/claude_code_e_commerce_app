import type {Metadata} from "next"
import {Inter} from "next/font/google"
import "./globals.css"
import {CartProvider} from "@/contexts/cart-context"

const inter = Inter({subsets: ["latin"]})

export const metadata: Metadata = {
    title: "E-Commerce Marketplace",
    description: "A multi-store e-commerce marketplace",
}

// This is the root-level layout component
export default function RootLayout(
    {
        children,
    }: {
        children: React.ReactNode
    }
) {

    return (
        <html lang="en">
        <body className={inter.className}>
            <CartProvider>
                {children}
            </CartProvider>
        </body>
        </html>
    )
}
