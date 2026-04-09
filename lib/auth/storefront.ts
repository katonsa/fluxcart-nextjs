import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

function buildStorefrontSignInUrl(redirectTo: string) {
  const params = new URLSearchParams({ redirectTo })

  return `/sign-in?${params.toString()}`
}

export async function requireStorefrontSession(redirectTo: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect(buildStorefrontSignInUrl(redirectTo))
  }

  return session
}
