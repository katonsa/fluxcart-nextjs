import type { OrderStatus } from "@/lib/generated/prisma/client"

export type DecimalLike = string | number | { toString(): string }

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface CategorySummary {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  _count?: {
    products: number
  }
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  description: string | null
  price: DecimalLike
  stock: number
  imageUrls: string[]
  isActive: boolean
  createdAt?: string
  category?: {
    id?: string
    name: string
    slug: string
  } | null
}

export interface CartItemView {
  id: string
  productId: string
  quantity: number
  product: ProductSummary
}

export interface CartView {
  id: string
  userId: string | null
  items: CartItemView[]
}

export interface AddressView {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface ProfileView {
  id: string
  name: string
  email: string
  image: string | null
  role: string | null
  createdAt?: string
}

export interface OrderItemView {
  id: string
  productId: string
  quantity: number
  unitPrice: DecimalLike
  productName: string
  productImage: string | null
}

export interface OrderSummary {
  id: string
  status: OrderStatus
  totalAmount: DecimalLike
  createdAt: string
  notes?: string | null
  items: OrderItemView[]
}

export interface OrderDetails extends OrderSummary {
  address: AddressView | null
}

export interface AdminOrderSummary extends OrderSummary {
  user: {
    name: string
    email: string
  }
}

export interface AdminOrderDetails extends OrderDetails {
  user: {
    name: string
    email: string
  }
}

export interface AdminStatsView {
  stats: {
    revenue: DecimalLike
    orders: number
    users: number
    products: number
  }
  recentOrders: AdminOrderSummary[]
}
