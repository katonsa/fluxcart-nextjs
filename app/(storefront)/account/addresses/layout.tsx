import type { ReactNode } from "react"
import { requireStorefrontSession } from "@/lib/auth/storefront"

export default async function AddressesLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireStorefrontSession("/account/addresses")

  return children
}
