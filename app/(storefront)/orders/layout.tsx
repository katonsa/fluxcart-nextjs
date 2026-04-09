import type { ReactNode } from "react"
import { RouteAuthExplainer } from "@/components/route-auth-explainer"
import { getStorefrontSession } from "@/lib/auth/storefront"

export default async function OrdersLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getStorefrontSession()

  if (!session?.user) {
    return (
      <RouteAuthExplainer
        title="Sign in to view your orders"
        description="Your order history, shipment status, and cancellation controls are tied to your customer account."
        redirectTo="/orders"
      />
    )
  }

  return children
}
