import { NextRequest, NextResponse } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { cartService } from "@/lib/modules/cart/cart.service"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

function getGuestSessionId(req: NextRequest) {
  return req.cookies.get("cart_session")?.value ?? crypto.randomUUID()
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user?.id) {
    const cart = await cartService.getCart({ userId: session.user.id })
    return ok(cart)
  }

  const sessionId = getGuestSessionId(req)
  const cart = await cartService.getCart({ sessionId })
  const response = NextResponse.json({ success: true, data: cart })
  response.cookies.set("cart_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
})

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user?.id) {
    const cart = await cartService.clearCart({ userId: session.user.id })
    return ok(cart)
  }

  const sessionId = getGuestSessionId(req)
  const cart = await cartService.clearCart({ sessionId })
  const response = NextResponse.json({ success: true, data: cart })
  response.cookies.set("cart_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
})
