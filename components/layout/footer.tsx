import Link from "next/link"
import { Store } from "lucide-react"

// This is the component for the header
export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Store className="h-6 w-6" />
              <span className="font-bold">Marketplace</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for everything. Discover unique products from independent sellers.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-foreground transition-colors">
                  All Stores
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Sell</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Seller Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
