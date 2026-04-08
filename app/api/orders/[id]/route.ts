import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAuth } from "@/lib/api/middleware"
import { orderService } from "@/lib/modules/orders/order.service"

type Params = Promise<{ id: string }>

export const GET = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    const order = await orderService.getById(ctx.user.id, id)
    return ok(order)
  })
)
