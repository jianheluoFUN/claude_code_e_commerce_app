import {notFound} from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {Star, Store, Minus, Plus, ShoppingCart} from "lucide-react"
import {createClient} from "@/lib/supabase/server"
import {formatPrice} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {AddToCartButton} from "@/components/cart/add-to-cart-button"
import type {Product, Review} from "@/lib/types"

interface ProductPageProps {
    params: Promise<{ slug: string }>
}

// This is the page for product details
export default async function ProductPage(
    {params}: ProductPageProps
) {

    // extract product slug from page routing parameters
    const {slug} = await params

    const supabase = await createClient()

    // Fetch product with store info
    // retrieve from "products" table based on "slug" field
    const {data: product} = await supabase
        .from("products")
        .select(`
      *,
      store:stores(id, name, slug, logo_url, status),
      category:categories(name, slug)
    `)
        .eq("slug", slug)
        .eq("status", "active")
        .single()


    if (!product || product.store?.status !== "approved") {
        notFound()
    }

    // Fetch reviews
    // retrieve from the "reviews" table based on the "product_id" field
    const {data: reviews} = await supabase
        .from("reviews")
        .select(`
      *,
      buyer:profiles(full_name, avatar_url)
    `)
        .eq("product_id", product.id)
        .eq("status", "visible")
        .order("created_at", {ascending: false})

    // Calculate average rating
    const avgRating =
        reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

    const hasDiscount = product.compare_price && product.compare_price > product.price

    return (
        <div className="container py-8">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">

                        {/* conditional rendering */}
                        {product.images && product.images.length > 0 ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No image available
                            </div>
                        )}
                    </div>

                    {/* conditional rendering */}
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">

                            {/* using "map" to iterate array */}
                            {product.images.slice(1, 5).map((image: string, index: number) => (
                                <div
                                    key={index}
                                    className="aspect-square relative bg-muted rounded-lg overflow-hidden"
                                >
                                    <Image
                                        src={image}
                                        alt={`${product.name} ${index + 2}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">

                        {/* Link to "/products" routing */}
                        <Link
                            href="/products"
                            className="hover:text-foreground"
                        >
                            Products
                        </Link>

                        <span>/</span>

                        {/* conditional rendering */}
                        {product.category && (
                            <>
                                {/* Link to "/products?category=${product.category.slug}" routing */}
                                <Link
                                    href={`/products?category=${product.category.slug}`}
                                    className="hover:text-foreground"
                                >
                                    {product.category.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-foreground">{product.name}</span>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                        {/* Rating */}
                        {/* conditional rendering */}
                        {reviews && reviews.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {/* using "map" function to iterate over array */}
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                                star <= avgRating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted-foreground"
                                            }`}
                                        />
                                    ))}
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    ({reviews.length} reviews)
                                </span>

                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-4">

                        <span className="text-3xl font-bold">
                            {formatPrice(product.price)}
                        </span>

                        {/* conditional rendering */}
                        {hasDiscount && (
                            <>

                                <span className="text-xl text-muted-foreground line-through">
                                    {formatPrice(product.compare_price!)}
                                </span>

                                <Badge variant="destructive">
                                    Save {Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)}%
                                </Badge>
                            </>
                        )}
                    </div>

                    {/* Stock */}
                    <div>

                        {/* conditional rendering */}
                        {product.inventory_count > 0 ? (
                            <Badge variant="success">In Stock ({product.inventory_count} available)</Badge>
                        ) : (
                            <Badge variant="secondary">Out of Stock</Badge>
                        )}
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground">
                                {product.description}
                            </p>
                        </div>
                    )}

                    {/* Add to Cart */}
                    {/* introduce "AddToCartButton" component */}
                    <AddToCartButton
                        product={product}
                    />

                    {/* Store Info */}
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                {/* conditional rendering */}
                                {product.store?.logo_url ? (
                                    <Image
                                        src={product.store.logo_url}
                                        alt={product.store.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <Store className="h-6 w-6 text-muted-foreground"/>
                                )}
                            </div>
                            <div className="flex-1">

                                <p className="font-medium">
                                    {product.store?.name}
                                </p>

                                {/* Link to "/stores/${product.store?.slug}" routing */}
                                <Link
                                    href={`/stores/${product.store?.slug}`}
                                    className="text-sm text-primary hover:underline"
                                >
                                    Visit Store
                                </Link>
                            </div>

                        </CardContent>

                    </Card>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16">

                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

                {/* conditional rendering */}
                {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">

                        {/* By using "map" function to iterate over the array */}
                        {reviews.map((review) => (

                            // introduce "Card" component
                            <Card key={review.id}>

                                <CardContent className="p-6">

                                    <div className="flex items-start justify-between mb-4">

                                        <div className="flex items-center gap-3">

                                            <div
                                                className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"
                                            >

                                                <span className="text-sm font-medium">
                                                    {review.buyer?.full_name?.charAt(0).toUpperCase() || "U"}
                                                </span>

                                            </div>

                                            <div>
                                                <p className="font-medium">{review.buyer?.full_name || "Anonymous"}</p>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                                star <= review.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                                    </div>
                                    {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                )}
            </div>
        </div>
    )
}
