import type { ReactNode } from "react"
import { RouteAuthExplainer } from "@/components/route-auth-explainer"
import { getStorefrontSession } from "@/lib/auth/storefront"

export default async function AccountLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getStorefrontSession()

  if (!session?.user) {
    return (
      <RouteAuthExplainer
        title="Sign in to manage your account"
        description="Update your profile and password after signing in to your FluxCart account."
        redirectTo="/account"
        footer="You’ll return to your account after authentication."
      />
    )
  }

  return children
}
