import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/api/middleware"
import { orderService } from "@/lib/modules/orders/order.service"
import { AdminOrderListQuerySchema } from "@/lib/modules/orders/order.schema"

export const GET = withErrorHandler(
  requireAdmin(async (_ctx, req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const query = AdminOrderListQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    })

    const orders = await orderService.adminList(query)
    return ok(orders)
  })
)
