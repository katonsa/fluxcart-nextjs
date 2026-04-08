import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/api/middleware"
import { orderService } from "@/lib/modules/orders/order.service"
import { AdminUpdateOrderStatusSchema } from "@/lib/modules/orders/order.schema"

type Params = Promise<{ id: string }>

export const PATCH = withErrorHandler(
  requireAdmin(async (_ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    const body = await req.json()
    const data = AdminUpdateOrderStatusSchema.parse(body)
    const order = await orderService.adminUpdateStatus(id, data)
    return ok(order)
  })
)
