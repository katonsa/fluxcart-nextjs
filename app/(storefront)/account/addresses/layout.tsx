import type { ReactNode } from "react"
import { RouteAuthExplainer } from "@/components/route-auth-explainer"
import { getStorefrontSession } from "@/lib/auth/storefront"

export default async function AddressesLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getStorefrontSession()

  if (!session?.user) {
    return (
      <RouteAuthExplainer
        title="Sign in to manage your addresses"
        description="Save delivery addresses for faster checkout and easier order management."
        redirectTo="/account/addresses"
        footer="You’ll return to your address book after authentication."
      />
    )
  }

  return children
}
