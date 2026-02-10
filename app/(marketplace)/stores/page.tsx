import Link from "next/link"
import Image from "next/image"
import {Store} from "lucide-react"
import {createClient} from "@/lib/supabase/server"
import {Card, CardContent} from "@/components/ui/card"

export default async function StoresPage() {
    const supabase = await createClient()

    const {data: stores} = await supabase
        .from("stores")
        .select(`
      *,
      owner:profiles(full_name),
      products:products(count)
    `)
        .eq("status", "approved")
        .order("created_at", {ascending: false})

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">All Stores</h1>
                <p className="text-muted-foreground">Discover unique stores and their products</p>
            </div>

            {stores && stores.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map((store) => (
                        <Link key={store.id} href={`/stores/${store.slug}`}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                                <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                                    {store.banner_url && (
                                        <Image
                                            src={store.banner_url}
                                            alt={store.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <CardContent className="p-6 pt-0">
                                    <div className="flex items-start gap-4 -mt-10 relative z-10">
                                        <div
                                            className="h-20 w-20 rounded-full bg-muted flex items-center justify-center shrink-0 border-4 border-background shadow-lg overflow-hidden">
                                            {store.logo_url ? (
                                                <Image
                                                    src={store.logo_url}
                                                    alt={store.name}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-full object-cover w-full h-full"
                                                />
                                            ) : (
                                                <Store className="h-8 w-8 text-muted-foreground"/>
                                            )}
                                        </div>
                                        <div className="flex-1 pt-12">
                                            <h3 className="font-semibold text-lg">{store.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                by {store.owner?.full_name || "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                    {store.description && (
                                        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                                            {store.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <Store className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                    <p>No stores available yet.</p>
                </div>
            )}
        </div>
    )
}
