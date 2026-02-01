import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Package, ArrowLeft, Store, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReviewForm } from "@/components/orders/review-form"
import type { ShippingAddress } from "@/lib/types"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

const statusColors = {
  pending: "warning",
  confirmed: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
} as const

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      store:stores(name, slug),
      items:order_items(
        *,
        product:products(id, name, slug, images)
      )
    `)
    .eq("id", id)
    .eq("buyer_id", user.id)
    .single()

  if (!order) {
    notFound()
  }

  // Fetch existing reviews for this order
  const { data: existingReviews } = await supabase
    .from("reviews")
    .select("product_id")
    .eq("order_id", id)
    .eq("buyer_id", user.id)

  const reviewedProductIds = new Set(existingReviews?.map((r) => r.product_id) || [])

  const address = order.shipping_address as ShippingAddress

  return (
    <div className="container py-8">
      <Link
        href="/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={statusColors[order.status as keyof typeof statusColors]} className="text-lg px-4 py-1">
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Store className="h-5 w-5" />
              <CardTitle>
                <Link
                  href={`/stores/${order.store?.slug}`}
                  className="hover:text-primary"
                >
                  {order.store?.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.items?.map((item: any) => (
                <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center shrink-0 relative overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.product?.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.quantity} x {formatPrice(item.unit_price)}
                      </p>
                      <p className="font-semibold mt-1">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  </div>

                  {/* Review Form - only show for delivered orders */}
                  {order.status === "delivered" &&
                    !reviewedProductIds.has(item.product?.id) && (
                      <div className="mt-4 pt-4 border-t">
                        <ReviewForm
                          orderId={order.id}
                          productId={item.product?.id}
                          productName={item.product?.name}
                        />
                      </div>
                    )}

                  {reviewedProductIds.has(item.product?.id) && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      You have already reviewed this product.
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{address.full_name}</p>
              <p className="text-muted-foreground">{address.address_line1}</p>
              {address.address_line2 && (
                <p className="text-muted-foreground">{address.address_line2}</p>
              )}
              <p className="text-muted-foreground">
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p className="text-muted-foreground">{address.country}</p>
              {address.phone && (
                <p className="text-muted-foreground mt-2">Phone: {address.phone}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
