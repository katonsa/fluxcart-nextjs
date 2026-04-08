import { NextRequest, NextResponse } from "next/server"
import { withErrorHandler } from "@/lib/api/errors"
import { created } from "@/lib/api/response"
import { cartService } from "@/lib/modules/cart/cart.service"
import { AddToCartSchema } from "@/lib/modules/cart/cart.schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

function getGuestSessionId(req: NextRequest) {
  return req.cookies.get("cart_session")?.value ?? crypto.randomUUID()
}

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() })
  const body = await req.json()
  const data = AddToCartSchema.parse(body)

  if (session?.user?.id) {
    const cart = await cartService.addItem({ userId: session.user.id }, data)
    return created(cart)
  }

  const sessionId = getGuestSessionId(req)
  const cart = await cartService.addItem({ sessionId }, data)
  const response = NextResponse.json({ success: true, data: cart }, { status: 201 })
  response.cookies.set("cart_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
})
