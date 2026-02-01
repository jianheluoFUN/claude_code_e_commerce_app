import { notFound } from "next/navigation"
import Image from "next/image"
import { Store } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/products/product-card"

interface StorePageProps {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch store
  const { data: store } = await supabase
    .from("stores")
    .select(`
      *,
      owner:profiles(full_name)
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .single()

  if (!store) {
    notFound()
  }

  // Fetch store products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (
    <div>
      {/* Store Header */}
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
        {store.banner_url && (
          <Image
            src={store.banner_url}
            alt={store.name}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="container">
        <div className="flex items-end gap-6 -mt-16 mb-8">
          <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border-4 border-background">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={128}
                height={128}
                className="rounded-full"
              />
            ) : (
              <Store className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <p className="text-muted-foreground">by {store.owner?.full_name || "Unknown"}</p>
          </div>
        </div>

        {store.description && (
          <p className="text-muted-foreground max-w-2xl mb-8">{store.description}</p>
        )}

        {/* Products */}
        <div className="py-8">
          <h2 className="text-2xl font-bold mb-6">Products ({products?.length || 0})</h2>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={{ ...product, store }} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">This store doesn&apos;t have any products yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
