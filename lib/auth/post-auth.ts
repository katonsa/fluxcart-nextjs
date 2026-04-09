"use client"

import type { ApiResponse, CartView } from "@/lib/types/api"

export function getSafeRedirectTarget(redirectTo: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/"
  }

  return redirectTo
}

export async function mergeGuestCart() {
  const res = await fetch("/api/cart/merge", {
    method: "POST",
  })

  const data = (await res.json()) as ApiResponse<CartView | { message: string }>

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to merge guest cart")
  }

  return data.data
}
