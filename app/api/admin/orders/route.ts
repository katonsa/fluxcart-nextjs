import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/api/middleware"
import { orderService } from "@/lib/modules/orders/order.service"

export const GET = withErrorHandler(
  requireAdmin(async (ctx, req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    const orders = await orderService.adminList({ status })
    return ok(orders)
  })
)
