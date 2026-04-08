import { NextRequest, NextResponse } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { cartService } from "@/lib/modules/cart/cart.service"
import { requireAuth } from "@/lib/api/middleware"

export const POST = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest) => {
    const sessionId = req.cookies.get("cart_session")?.value
    
    if (!sessionId) {
      return ok({ message: "No guest cart to merge" })
    }

    const cart = await cartService.mergeCarts(sessionId, ctx.user.id)
    
    const response = NextResponse.json({ success: true, data: cart })
    response.cookies.delete("cart_session")
    
    return response
  })
)
