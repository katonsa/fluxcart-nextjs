import { NextRequest } from "next/server"
import { ok, created } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAuth } from "@/lib/api/middleware"
import { orderService } from "@/lib/modules/orders/order.service"
import { CreateOrderSchema } from "@/lib/modules/orders/order.schema"

export const GET = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest) => {
    const orders = await orderService.list(ctx.user.id)
    return ok(orders)
  })
)

export const POST = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest) => {
    const body = await req.json()
    const data = CreateOrderSchema.parse(body)
    const order = await orderService.create(ctx.user.id, data)
    return created(order)
  })
)
