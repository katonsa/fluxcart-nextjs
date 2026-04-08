import { z } from "zod"

export const AddToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
})

export type AddToCartInput = z.infer<typeof AddToCartSchema>

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
})

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
