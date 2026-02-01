import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { LayoutDashboard, Package, ShoppingCart, Settings, BarChart3 } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "store_owner" && profile.role !== "admin")) {
    redirect("/")
  }

  // Check if user has a store
  const { data: store } = await supabase
    .from("stores")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .single()

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/products", icon: Package, label: "Products" },
    { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/dashboard/settings", icon: Settings, label: "Store Settings" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={profile} />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 hidden md:block">
          <div className="p-6">
            {store ? (
              <div className="mb-6">
                <h2 className="font-semibold truncate">{store.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {store.status}
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">No store yet</p>
              </div>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
