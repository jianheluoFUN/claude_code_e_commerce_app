import Stripe from 'stripe'
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

// Client-side Stripe promise (lazy loaded)
let stripePromise: Promise<StripeJS | null> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Types for checkout
export interface CheckoutItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface CreateCheckoutSessionParams {
  items: CheckoutItem[]
  orderId: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
}
