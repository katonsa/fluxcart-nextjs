import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler, ApiError } from "@/lib/api/errors"
import { cartService } from "@/lib/modules/cart/cart.service"
import { UpdateCartItemSchema } from "@/lib/modules/cart/cart.schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

type Params = Promise<{ id: string }>

const getIdentifier = async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() })
  const cartId = req.cookies.get("cart_session")?.value

  if (!session?.user && !cartId) {
    throw ApiError.unauthorized("No active cart found")
  }

  return session?.user?.id 
    ? { userId: session.user.id } 
    : { cartId: cartId }
}

export const PATCH = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { id } = await params
  const identifier = await getIdentifier(req)
  
  const body = await req.json()
  const data = UpdateCartItemSchema.parse(body)
  
  const cart = await cartService.updateItem(identifier, id, data)
  return ok(cart)
})

export const DELETE = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { id } = await params
  const identifier = await getIdentifier(req)
  
  const cart = await cartService.removeItem(identifier, id)
  return ok(cart)
})
