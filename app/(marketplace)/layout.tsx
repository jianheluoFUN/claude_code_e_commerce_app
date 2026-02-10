import {createClient} from "@/lib/supabase/server"
import {Header} from "@/components/layout/header"
import {Footer} from "@/components/layout/footer"

export default async function MarketplaceLayout({
                                                    children,
                                                }: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const {data} = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
        profile = data
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header user={profile}/>
            <main className="flex-1">{children}</main>
            <Footer/>
        </div>
    )
}
