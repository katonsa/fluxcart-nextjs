import type { ReactNode } from "react"
import { requireStorefrontSession } from "@/lib/auth/storefront"

export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireStorefrontSession("/account")

  return children
}
