import type { ReactNode } from "react"
import { requireStorefrontSession } from "@/lib/auth/storefront"

export default async function CheckoutLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireStorefrontSession("/checkout")

  return children
}
