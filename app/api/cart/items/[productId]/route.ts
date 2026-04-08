import { NextRequest, NextResponse } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler, ApiError } from "@/lib/api/errors"
import { cartService } from "@/lib/modules/cart/cart.service"
import { UpdateCartItemSchema } from "@/lib/modules/cart/cart.schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type Params = Promise<{ productId: string }>

function getGuestSessionId(req: NextRequest) {
  return req.cookies.get("cart_session")?.value ?? null
}

async function getIdentifier(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.id) {
    return { userId: session.user.id }
  }

  const sessionId = getGuestSessionId(req)
  if (!sessionId) {
    throw ApiError.unauthorized("No active cart found")
  }

  return { sessionId }
}

export const PATCH = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { productId } = await params
  const identifier = await getIdentifier(req)
  const body = await req.json()
  const data = UpdateCartItemSchema.parse(body)
  const cart = await cartService.updateItem(identifier, productId, data)

  if ("sessionId" in identifier && identifier.sessionId) {
    const response = NextResponse.json({ success: true, data: cart })
    response.cookies.set("cart_session", identifier.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  }

  return ok(cart)
})

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { productId } = await params
  const identifier = await getIdentifier(req)
  const cart = await cartService.removeItem(identifier, productId)

  if ("sessionId" in identifier && identifier.sessionId) {
    const response = NextResponse.json({ success: true, data: cart })
    response.cookies.set("cart_session", identifier.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  }

  return ok(cart)
})
