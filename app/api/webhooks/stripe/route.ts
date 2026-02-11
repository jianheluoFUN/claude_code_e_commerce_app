import {NextRequest, NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {stripe} from '@/lib/stripe'
import {createClient} from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

// This is the API route for the "/api/webhooks/stripe"
export async function POST(
    request: NextRequest
) {

    const body = await request.text()
    console.log(`[POST /api/webhooks/stripe] body: ${JSON.stringify(body)}`)

    const headersList = await headers()
    console.log(`[POST /api/webhooks/stripe] headersList: ${JSON.stringify(headersList)}`)

    const signature = headersList.get('stripe-signature')
    console.log(`[POST /api/webhooks/stripe] signature: ${JSON.stringify(signature)}`)

    if (!signature) {
        return NextResponse.json(
            {error: 'Missing stripe-signature header'},
            {status: 400}
        )
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )

        console.log(`[POST /api/webhooks/stripe] event: ${JSON.stringify(event)}`)
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json(
            {error: 'Webhook signature verification failed'},
            {status: 400}
        )
    }

    // Handle the event
    switch (event.type) {
        // if the checkout session completed from Stripe side, the event will be issued
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session

            // Get order IDs from metadata
            const orderIds = session.metadata?.order_ids?.split(',') || []

            if (orderIds.length > 0) {
                // Update all orders to 'paid' status
                for (const orderId of orderIds) {
                    const {error} = await supabaseAdmin
                        .from('orders')
                        .update({
                            status: 'paid',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', orderId.trim())

                    if (error) {
                        console.error(`Failed to update order ${orderId}:`, error)
                    } else {
                        console.log(`Order ${orderId} marked as paid`)
                    }
                }

                // Clear cart items for the user
                const userId = session.metadata?.user_id
                if (userId) {
                    await supabaseAdmin
                        .from('cart_items')
                        .delete()
                        .eq('buyer_id', userId)
                }

                // Update inventory for each order item
                for (const orderId of orderIds) {
                    const {data: orderItems} = await supabaseAdmin
                        .from('order_items')
                        .select('product_id, quantity')
                        .eq('order_id', orderId.trim())

                    if (orderItems) {
                        for (const item of orderItems) {
                            // Decrement inventory
                            const {data: product} = await supabaseAdmin
                                .from('products')
                                .select('inventory_count')
                                .eq('id', item.product_id)
                                .single()

                            if (product) {
                                const newCount = Math.max(0, product.inventory_count - item.quantity)
                                await supabaseAdmin
                                    .from('products')
                                    .update({inventory_count: newCount})
                                    .eq('id', item.product_id)
                            }
                        }
                    }
                }
            }

            break
        }

        // if the checkout session expired from Stripe side, the event will be issued
        case 'checkout.session.expired': {
            const session = event.data.object as Stripe.Checkout.Session
            const orderIds = session.metadata?.order_ids?.split(',') || []

            // Cancel orders that weren't paid
            for (const orderId of orderIds) {
                await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'cancelled',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', orderId.trim())
                    .eq('status', 'pending') // Only cancel if still pending
            }

            break
        }

        // if the checkout session failed from Stripe side, the event will be issued
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            console.log('Payment failed:', paymentIntent.id)
            // Could send email notification to user here
            break
        }

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({received: true})
}
