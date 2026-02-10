"use client"

import Link from "next/link"
import {useRouter} from "next/navigation"
import {ShoppingCart, User, Store, LogOut, LayoutDashboard, Settings, Shield, ShoppingBag} from "lucide-react"
import {createClient} from "@/lib/supabase/client"
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Badge} from "@/components/ui/badge"
import type {Profile, UserRole} from "@/lib/types"

const roleConfig: Record<UserRole, {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode
}> = {
    admin: {label: "Admin", variant: "destructive", icon: <Shield className="h-3 w-3"/>},
    store_owner: {label: "Store Owner", variant: "default", icon: <Store className="h-3 w-3"/>},
    buyer: {label: "Buyer", variant: "secondary", icon: <ShoppingBag className="h-3 w-3"/>},
}

interface HeaderProps {
    user: Profile | null
}

// This is the component for the header
export function Header(
    {
        user
    }: HeaderProps
) {
    const router = useRouter()

    // callback handler to logout
    const handleLogout = async () => {

        const supabase = createClient()

        await supabase.auth.signOut()

        // reroute to "/" routing
        router.push("/")
        router.refresh()
    }

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Link to "/" routing */}
                    <Link href="/" className="flex items-center gap-2">
                        <Store className="h-6 w-6"/>
                        <span className="font-bold text-xl">Marketplace</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {/* Link to "/products" routing */}
                        <Link href="/products"
                              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Products
                        </Link>

                        {/* Link to "/stores" routing */}
                        <Link href="/stores"
                              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Stores
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* conditional rendering */}
                    {user ? (
                        <>
                            {/* Link to "/cart" routing */}
                            <Link href="/cart">
                                <Button variant="ghost" size="icon">
                                    <ShoppingCart className="h-5 w-5"/>
                                </Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || ""}/>
                                            <AvatarFallback>
                                                {/* conditional rendering */}
                                                {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium leading-none">
                                                    {user.full_name || "User"}
                                                </p>
                                                <Badge variant={roleConfig[user.role].variant} className="flex items-center gap-1 text-xs">
                                                    {roleConfig[user.role].icon}
                                                    {roleConfig[user.role].label}
                                                </Badge>
                                            </div>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    {(user.role === "store_owner" || user.role === "admin") && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard">
                                                <LayoutDashboard className="mr-2 h-4 w-4"/>
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {/* conditional rendering */}
                                    {user.role === "admin" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">
                                                <Settings className="mr-2 h-4 w-4"/>
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders">
                                            <ShoppingCart className="mr-2 h-4 w-4"/>
                                            My Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">
                                            <User className="mr-2 h-4 w-4"/>
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4"/>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost">Sign in</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Sign up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
