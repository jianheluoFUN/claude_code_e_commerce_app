import {NextResponse, type NextRequest} from 'next/server'
import {updateSession} from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {

    const {response, user, supabase} = await updateSession(request)

    const {pathname} = request.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/products',
        '/stores',
        '/login',
        '/register'
    ]

    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith('/products/') || pathname.startsWith('/stores/')
    )

    // Auth routes (login, register)
    const authRoutes = [
        '/login',
        '/register'
    ]

    const isAuthRoute = authRoutes.includes(pathname)

    // Protected route patterns
    const buyerRoutes = ['/orders', '/cart', '/checkout', '/profile']
    const storeOwnerRoutes = ['/dashboard']
    const adminRoutes = ['/admin']

    const isBuyerRoute = buyerRoutes.some(route => pathname.startsWith(route))
    const isStoreOwnerRoute = storeOwnerRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    // If user is logged in and tries to access auth routes, redirect to home
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If no user and trying to access protected routes, redirect to login
    if (!user && (isBuyerRoute || isStoreOwnerRoute || isAdminRoute)) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Check role-based access
    if (user && (isStoreOwnerRoute || isAdminRoute)) {
        const {data: profile} = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile) {
            // Store owner routes require store_owner or admin role
            if (isStoreOwnerRoute && profile.role !== 'store_owner' && profile.role !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url))
            }

            // Admin routes require admin role
            if (isAdminRoute && profile.role !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
