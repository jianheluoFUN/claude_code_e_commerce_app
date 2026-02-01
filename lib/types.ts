export type UserRole = 'admin' | 'store_owner' | 'buyer'

export type StoreStatus = 'pending' | 'approved' | 'suspended'

export type ProductStatus = 'draft' | 'active' | 'archived'

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export type ReviewStatus = 'visible' | 'hidden' | 'flagged'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  status: StoreStatus
  created_at: string
  updated_at: string
  owner?: Profile
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  created_at: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  category_id: string | null
  images: string[]
  inventory_count: number
  status: ProductStatus
  created_at: string
  updated_at: string
  store?: Store
  category?: Category
}

export interface Order {
  id: string
  buyer_id: string
  store_id: string
  status: OrderStatus
  total_amount: number
  shipping_address: ShippingAddress
  created_at: string
  updated_at: string
  buyer?: Profile
  store?: Store
  items?: OrderItem[]
}

export interface ShippingAddress {
  full_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  buyer_id: string
  order_id: string
  rating: number
  comment: string | null
  status: ReviewStatus
  created_at: string
  buyer?: Profile
  product?: Product
}

export interface CartItem {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}
