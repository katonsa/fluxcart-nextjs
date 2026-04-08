import { z } from "zod"

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>

export const AddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required").default("US"),
  isDefault: z.boolean().optional().default(false),
})

export type AddressInput = z.infer<typeof AddressSchema>

export const CreateAddressSchema = AddressSchema
export const UpdateAddressSchema = AddressSchema.partial()
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>
