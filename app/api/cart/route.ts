import { NextRequest, NextResponse } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { cartService } from "@/lib/modules/cart/cart.service"
import { AddToCartSchema } from "@/lib/modules/cart/cart.schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() })
  let cartId = req.cookies.get("cart_session")?.value

  const isGuestWithoutSession = !session?.user && !cartId

  const identifier = session?.user?.id 
    ? { userId: session.user.id } 
    : cartId ? { cartId } : {}

  const cart = await cartService.getCart(identifier)
  
  const response = NextResponse.json({ success: true, data: cart })
  
  if (isGuestWithoutSession && cart) {
     response.cookies.set("cart_session", cart.id, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "lax",
       maxAge: 60 * 60 * 24 * 30 // 30 days
     })
  }

  return response
})

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() })
  let cartId = req.cookies.get("cart_session")?.value

  const isGuestWithoutSession = !session?.user && !cartId

  // The addItem method needs a cart to exist, or we can get it and then add
  let identifier: any = session?.user?.id ? { userId: session.user.id } : { cartId }
  
  if (isGuestWithoutSession && !cartId) {
     const newCart = await cartService.getCart({})
     cartId = newCart.id;
     identifier = { cartId }
  }

  const body = await req.json()
  const data = AddToCartSchema.parse(body)
  
  const cart = await cartService.addItem(identifier, data)

  const response = NextResponse.json({ success: true, data: cart }, { status: 201 })
  
  if (isGuestWithoutSession) {
     response.cookies.set("cart_session", cartId!, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "lax",
       maxAge: 60 * 60 * 24 * 30 // 30 days
     })
  }

  return response
})
