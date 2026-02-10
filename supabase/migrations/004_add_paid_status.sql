-- Add 'paid' status to order_status enum

-- First, we need to add the new value to the existing enum
-- PostgreSQL allows adding values to enums with ALTER TYPE
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid' AFTER 'pending';

-- Note: The order will now be: pending -> paid -> confirmed -> shipped -> delivered -> cancelled
-- This represents the flow:
-- 1. pending - Order created, awaiting payment
-- 2. paid - Payment received via Stripe
-- 3. confirmed - Store owner confirmed the order
-- 4. shipped - Order has been shipped
-- 5. delivered - Order delivered to customer
-- 6. cancelled - Order was cancelled

