import type { ReactNode } from "react"
import { requireStorefrontSession } from "@/lib/auth/storefront"

type Params = Promise<{ id: string }>

export default async function OrderDetailLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Params
}) {
  const { id } = await params

  await requireStorefrontSession(`/orders/${id}`)

  return children
}
