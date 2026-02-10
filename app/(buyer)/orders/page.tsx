import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const statusColors = {
  pending: "warning",
  paid: "success",
  confirmed: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
} as const

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirect=/orders")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      store:stores(name, slug),
      items:order_items(
        *,
        product:products(name, slug, images)
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()} from{" "}
                    <Link
                      href={`/stores/${order.store?.slug}`}
                      className="text-primary hover:underline"
                    >
                      {order.store?.name}
                    </Link>
                  </p>
                </div>
                <Badge variant={statusColors[order.status as keyof typeof statusColors]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.product?.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{formatPrice(order.total_amount)}</p>
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            When you place orders, they will appear here.
          </p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
