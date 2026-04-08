import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler, ApiError } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/api/middleware"
import { orderService } from "@/lib/modules/orders/order.service"

type Params = Promise<{ id: string }>

export const PATCH = withErrorHandler(
  requireAdmin(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    const body = await req.json()
    
    if (!body.status) {
       throw ApiError.badRequest("Status is required")
    }

    const order = await orderService.adminUpdateStatus(id, body.status)
    return ok(order)
  })
)
