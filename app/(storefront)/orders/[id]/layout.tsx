import type { ReactNode } from "react"
import { RouteAuthExplainer } from "@/components/route-auth-explainer"
import { getStorefrontSession } from "@/lib/auth/storefront"

type Params = Promise<{ id: string }>

export default async function OrderDetailLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Params
}) {
  const { id } = await params

  const session = await getStorefrontSession()

  if (!session?.user) {
    return (
      <RouteAuthExplainer
        title={`Sign in to view order #${id.slice(-8).toUpperCase()}`}
        description="Order details are private to the customer account that placed the purchase. Sign in to review items, shipping details, and cancellation status."
        redirectTo={`/orders/${id}`}
      />
    )
  }

  return children
}
