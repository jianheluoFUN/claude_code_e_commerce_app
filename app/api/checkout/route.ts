import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, items, shippingAddress } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    // Create line items for Stripe
    const lineItems = items.map((item: {
      name: string
      price: number
      quantity: number
      image?: string
    }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }))

    // Create or get an order
    let finalOrderId = orderId

    if (!finalOrderId) {
      // Group items by store to create orders
      const itemsByStore: Record<string, typeof items> = {}

      for (const item of items) {
        // Get product to find store_id
        const { data: product } = await supabase
          .from('products')
          .select('store_id')
          .eq('id', item.productId)
          .single()

        if (product) {
          if (!itemsByStore[product.store_id]) {
            itemsByStore[product.store_id] = []
          }
          itemsByStore[product.store_id].push(item)
        }
      }

      // Create orders for each store
      const orderIds: string[] = []

      for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
        const totalAmount = storeItems.reduce(
          (sum: number, item: { price: number; quantity: number }) =>
            sum + item.price * item.quantity,
          0
        )

        // Create the order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            store_id: storeId,
            status: 'pending',
            total_amount: totalAmount,
            shipping_address: shippingAddress || {
              line1: '',
              city: '',
              state: '',
              postal_code: '',
              country: 'US',
            },
          })
          .select()
          .single()

        if (orderError) {
          console.error('Order creation error:', orderError)
          continue
        }

        // Create order items
        for (const item of storeItems) {
          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          })
        }

        orderIds.push(order.id)
      }

      finalOrderId = orderIds.join(',')
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_ids=${finalOrderId}`,
      cancel_url: `${request.nextUrl.origin}/checkout/cancel?order_ids=${finalOrderId}`,
      customer_email: profile?.email || user.email,
      metadata: {
        order_ids: finalOrderId,
        user_id: user.id,
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
