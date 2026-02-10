"use client"

import {useState, useEffect} from "react"
import {useRouter, useParams} from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {ArrowLeft, Loader2, Plus, X} from "lucide-react"
import {createClient} from "@/lib/supabase/client"
import {slugify} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type {Category, ProductStatus} from "@/lib/types"

// This is the page component for edit the page
// The routing is "/dashboard/products/<product_id>"
export default function EditProductPage() {

    const router = useRouter()

    const params = useParams()

    // extract the product id from the request path parameter
    const productId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [categories, setCategories] = useState<Category[]>([])

    // create a new state to keep track of the product form state
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        price: "",
        compare_price: "",
        category_id: "",
        inventory_count: "0",
        status: "draft" as ProductStatus,
        images: [] as string[],
    })

    // create a new state to keep track of new image url
    const [newImageUrl, setNewImageUrl] = useState("")

    const [error, setError] = useState<string | null>(null)

    // By using the "useEffect()" hook
    useEffect(() => {

            // define the function to fetch data from "categories" table
            const fetchData = async () => {

                const supabase = createClient()

                // Fetch categories
                const {
                    data: categoriesData
                } = await supabase
                    .from("categories")
                    .select("*")
                    .order("name")

                if (categoriesData) {
                    // update state
                    setCategories(categoriesData)
                }

                // Fetch product from "products" table based on product id
                const {data: product} = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", productId)
                    .single()

                if (product) {
                    // update state "formData" by using the retrieved product from "products" table
                    setFormData(
                        {
                            name: product.name,
                            slug: product.slug,
                            description: product.description || "",
                            price: product.price.toString(),
                            compare_price: product.compare_price?.toString() || "",
                            category_id: product.category_id || "",
                            inventory_count: product.inventory_count.toString(),
                            status: product.status,
                            images: product.images || [],
                        }
                    )
                }

                setLoading(false)
            }

            fetchData()

        },
        // dependency array
        [productId]
    )

    const handleNameChange = (
        name: string
    ) => {
        // update state
        setFormData({
            ...formData,
            name,
            slug: slugify(name),
        })
    }

    // The callback handler function to
    const addImage = () => {

        if (newImageUrl && !formData.images.includes(newImageUrl)) {

            // update state
            setFormData({
                ...formData,
                images: [...formData.images, newImageUrl],
            })

            // update state
            setNewImageUrl("")
        }
    }

    const removeImage = (url: string) => {
        setFormData({
            ...formData,
            images: formData.images.filter((img) => img !== url),
        })
    }

    // callback handler function whenever the "Save Changes" button is clicked
    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault()

        // update state
        setSaving(true)

        // update state
        setError(null)

        const supabase = createClient()

        // update against "products" table based on "id"
        const {
            error: updateError
        } = await supabase
            .from("products")
            .update(
                {
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
                    category_id: formData.category_id || null,
                    inventory_count: parseInt(formData.inventory_count),
                    status: formData.status,
                    images: formData.images,
                }
            )
            .eq("id", productId)

        if (updateError) {
            // update state
            setError(updateError.message)

            // update state
            setSaving(false)
            return
        }

        // reroute to "/dashboard/products" routing
        router.push("/dashboard/products")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
        )
    }

    return (
        <div className="max-w-2xl">
            {/* Link to "/dashboard/products" routing */}
            <Link
                href="/dashboard/products"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2"/>
                Back to Products
            </Link>

            <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

            {/* The form submission will trigger the "handleSubmit" function */}
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* basic information card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={
                                    (e) => handleNameChange(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={
                                    // update state
                                    (e) => setFormData(
                                        {
                                            ...formData,
                                            slug: e.target.value
                                        }
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={
                                    (e) =>
                                        // update state
                                        setFormData(
                                            {
                                                ...formData,
                                                description: e.target.value
                                            }
                                        )
                                }
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) =>
                                    setFormData(
                                        {
                                            ...formData,
                                            category_id: value
                                        }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {/* By using the "map" function to iterate over the "categories" array */}
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* pricing & inventory information card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing & Inventory</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price ($)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={
                                        // update state
                                        (e) =>
                                            setFormData(
                                                {
                                                    ...formData,
                                                    price: e.target.value
                                                }
                                            )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="compare_price">Compare at Price ($)</Label>
                                <Input
                                    id="compare_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.compare_price}
                                    onChange={(e) =>
                                        // update state
                                        setFormData({
                                                ...formData,
                                                compare_price: e.target.value
                                            }
                                        )
                                    }
                                    placeholder="Original price (optional)"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="inventory">Inventory Count</Label>
                            <Input
                                id="inventory"
                                type="number"
                                min="0"
                                value={formData.inventory_count}
                                onChange={
                                    (e) =>
                                        setFormData(
                                            {
                                                ...formData,
                                                inventory_count: e.target.value
                                            }
                                        )
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: ProductStatus) =>
                                    setFormData(
                                        {
                                            ...formData,
                                            status: value
                                        }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter image URL"
                                value={newImageUrl}
                                onChange={
                                    // update state
                                    (e) => setNewImageUrl(e.target.value)
                                }
                            />
                            {/*
                                Button to add more image url to the product

                                 The callback handler function is "addImage"
                            */}
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addImage}
                            >
                                <Plus className="h-4 w-4"/>
                            </Button>
                        </div>

                        {/* conditional rendering */}
                        {formData.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">

                                {/* By using "map" function to iterate over the "formData.images" */}
                                {formData.images.map(
                                    (url, index) => (
                                        <div key={index} className="relative group h-24">
                                            <Image
                                                src={url}
                                                alt={`Product image ${index + 1}`}
                                                fill
                                                className="object-cover rounded-md"
                                            />

                                            {/* Button to remove image */}
                                            <button
                                                type="button"
                                                onClick={
                                                    () => removeImage(url)
                                                }
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X className="h-3 w-3"/>
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">

                    <Button type="submit" disabled={saving}>
                        {/* conditional rendering */}
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Changes
                    </Button>

                    {/* Link to "/dashboard/products" routing */}
                    <Link href="/dashboard/products">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    )
}
