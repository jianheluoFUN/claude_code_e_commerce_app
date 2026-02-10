import {redirect} from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {Package, Plus, MoreHorizontal, Pencil, Trash2, ExternalLink} from "lucide-react"
import {createClient} from "@/lib/supabase/server"
import {formatPrice} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This is the page component for displaying the products for the store
export default async function ProductsPage() {

    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Get user's store
    const {data: store} = await supabase
        .from("stores")
        .select("id, status")
        .eq("owner_id", user.id)
        .single()

    if (!store) {
        redirect("/dashboard/settings")
    }

    // Fetch products with sold count from order_items
    // The query will be run against both "products" and "order_items" table based on "store_id"
    const {
        data: products
    } = await supabase
        .from("products")
        .select(`
            *,
            category:categories(name),
            order_items(quantity)
            `)
        .eq("store_id", store.id)
        .order("created_at", {ascending: false})

    // Calculate total sold for each product
    const productsWithSold = products?.map(
        product => {
            const totalSold = product.order_items?.reduce(
                (sum: number, item: { quantity: number }) => sum + item.quantity,
                0
            ) || 0

            return {
                ...product,
                totalSold
            }
        })
    console.log(`[ProductsPage] productsWithSold: ${JSON.stringify(productsWithSold)}`)

    const isStoreApproved = store.status === "approved"

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Products</h1>
                    <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
                {/* conditional rendering */}
                {isStoreApproved && (
                    <Link href="/dashboard/products/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4"/>
                            Add Product
                        </Button>
                    </Link>
                )}
            </div>

            {!isStoreApproved && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                        Your store is pending approval. You can add products once your store is approved.
                    </p>
                </div>
            )}

            {productsWithSold && productsWithSold.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Sold</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productsWithSold.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="h-12 w-12 bg-muted rounded-md overflow-hidden">
                                            {/* conditional rendering */}
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-muted-foreground"/>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {/* Link to "/products/<slug>" routing */}
                                        <Link
                                            href={`/products/${product.slug}`}
                                            target="_blank"
                                            className="hover:text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            {product.name}
                                            <ExternalLink className="h-3 w-3 opacity-50"/>
                                        </Link>
                                    </TableCell>
                                    <TableCell>{product.category?.name || "—"}</TableCell>
                                    <TableCell>{formatPrice(product.price)}</TableCell>
                                    <TableCell>{product.inventory_count}</TableCell>
                                    <TableCell>{product.totalSold}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.status === "active"
                                                    ? "success"
                                                    : product.status === "archived"
                                                        ? "secondary"
                                                        : "default"
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/products/${product.id}/edit`}>
                                                        <Pencil className="mr-2 h-4 w-4"/>
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4"/>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-16 border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground"/>
                    <h2 className="text-xl font-semibold mb-2">No products yet</h2>
                    <p className="text-muted-foreground mb-6">
                        Start adding products to your store.
                    </p>
                    {isStoreApproved && (
                        <Link href="/dashboard/products/new">
                            <Button>Add Your First Product</Button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
