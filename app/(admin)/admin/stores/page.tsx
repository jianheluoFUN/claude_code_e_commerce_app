import Link from "next/link"
import Image from "next/image"
import { Store } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StoreStatusButton } from "@/components/admin/store-status-button"

const statusColors = {
  pending: "warning",
  approved: "success",
  suspended: "destructive",
} as const

export default async function StoresPage() {
  const supabase = await createClient()

  const { data: stores } = await supabase
    .from("stores")
    .select(`
      *,
      owner:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })

  const pendingStores = stores?.filter((s) => s.status === "pending") || []
  const approvedStores = stores?.filter((s) => s.status === "approved") || []
  const suspendedStores = stores?.filter((s) => s.status === "suspended") || []

  const StoreTable = ({ storeList }: { storeList: typeof stores }) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {storeList && storeList.length > 0 ? (
            storeList.map((store) => (
              <TableRow key={store.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
                      {store.logo_url ? (
                        <Image
                          src={store.logo_url}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Store className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-muted-foreground">/{store.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{store.owner?.full_name || "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {store.owner?.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[store.status as keyof typeof statusColors]}>
                    {store.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(store.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StoreStatusButton storeId={store.id} currentStatus={store.status} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No stores found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stores</h1>
        <p className="text-muted-foreground">Review and manage stores</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingStores.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedStores.length})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({suspendedStores.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          <StoreTable storeList={pendingStores} />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <StoreTable storeList={approvedStores} />
        </TabsContent>
        <TabsContent value="suspended" className="mt-6">
          <StoreTable storeList={suspendedStores} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
