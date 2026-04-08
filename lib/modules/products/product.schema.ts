import { z } from "zod"

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  imageUrls: z.array(z.string().url("Must be a valid URL")).optional(),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().optional().default(true),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = CreateProductSchema.partial()

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest"]).optional().default("newest"),
})

export type ProductQuery = z.input<typeof ProductQuerySchema>

export const InventoryUpdateSchema = z.object({
  stock: z.number().int().min(0, "Stock cannot be negative"),
})

export type InventoryUpdateInput = z.infer<typeof InventoryUpdateSchema>
