import { z } from "zod"
import { OrderStatus } from "@/lib/generated/prisma/client"

export const CreateOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  notes: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

export const OrderStatusSchema = z.nativeEnum(OrderStatus)

export const AdminOrderListQuerySchema = z.object({
  status: OrderStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
})

export type AdminOrderListQuery = z.infer<typeof AdminOrderListQuerySchema>

export const AdminUpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
})

export type AdminUpdateOrderStatusInput = z.infer<typeof AdminUpdateOrderStatusSchema>
