import { createClient } from "@/lib/supabase/server"
import { ProductCard } from "@/components/products/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // Build query
  let query = supabase
    .from("products")
    .select(`
      *,
      store:stores!inner(name, slug, status)
    `)
    .eq("status", "active")
    .eq("stores.status", "approved")

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`)
  }

  if (params.category) {
    const category = categories?.find((c) => c.slug === params.category)
    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  const { data: products } = await query.order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Search */}
            <form className="relative">
              <Input
                type="search"
                name="search"
                placeholder="Search products..."
                defaultValue={params.search}
                className="pr-10"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-1">
                <a
                  href="/products"
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    !params.category
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  All Products
                </a>
                {categories?.map((category) => (
                  <a
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      params.category === category.slug
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {params.category
                ? categories?.find((c) => c.slug === params.category)?.name || "Products"
                : params.search
                ? `Search results for "${params.search}"`
                : "All Products"}
            </h1>
            <p className="text-muted-foreground">
              {products?.length || 0} products
            </p>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
