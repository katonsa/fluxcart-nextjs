import type { ReactNode } from "react"
import { requireStorefrontSession } from "@/lib/auth/storefront"

export default async function OrdersLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireStorefrontSession("/orders")

  return children
}
