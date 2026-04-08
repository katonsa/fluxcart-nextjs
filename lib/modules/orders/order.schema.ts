import { z } from "zod"

export const CreateOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  notes: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
