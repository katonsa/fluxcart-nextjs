import type { ReactNode } from "react"
import { getStorefrontSession } from "@/lib/auth/storefront"
import { RouteAuthExplainer } from "@/components/route-auth-explainer"

export default async function CheckoutLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getStorefrontSession()

  if (!session?.user) {
    return (
      <RouteAuthExplainer
        title="Sign in to finish checkout"
        description="Use your saved address book and complete your order after signing in."
        redirectTo="/checkout"
      />
    )
  }

  return children
}
