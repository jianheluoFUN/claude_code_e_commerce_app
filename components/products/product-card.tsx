import Image from "next/image"
import Link from "next/link"
import {formatPrice} from "@/lib/utils"
import {Card, CardContent, CardFooter} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import type {Product} from "@/lib/types"

interface ProductCardProps {
    product: Product
}

// This is the component for displaying individual product
export function ProductCard(
    {product}: ProductCardProps
) {

    const hasDiscount = product.compare_price && product.compare_price > product.price

    const discountPercentage = hasDiscount
        ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
        : 0

    return (
        // Link to the "/products/${product.slug}" routing
        <Link href={`/products/${product.slug}`}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-muted">

                    {/* conditional rendering */}
                    {product.images && product.images.length > 0 ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                        </div>
                    )}

                    {/* conditional rendering */}
                    {hasDiscount && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                            -{discountPercentage}%
                        </Badge>
                    )}


                    {/* conditional rendering */}
                    {product.inventory_count === 0 && (
                        <Badge variant="secondary" className="absolute top-2 left-2">
                            Out of stock
                        </Badge>
                    )}
                </div>

                <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-2">{product.name}</h3>

                    {/* conditional rendering */}
                    {product.store && (
                        <p className="text-sm text-muted-foreground mt-1">{product.store.name}</p>
                    )}
                </CardContent>

                <CardFooter className="p-4 pt-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{formatPrice(product.price)}</span>

                        {/* conditional rendering */}
                        {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.compare_price!)}
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}
