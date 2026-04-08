import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAdmin } from "@/lib/api/middleware"
import { db } from "@/lib/db"

export const GET = withErrorHandler(
  requireAdmin(async () => {
    const [totalOrders, totalRevenueAgg, totalUsers, totalProducts] = await Promise.all([
      db.order.count(),
      db.order.aggregate({ _sum: { totalAmount: true } }),
      db.user.count(),
      db.product.count()
    ])
    
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    })
    
    return ok({
      stats: {
        revenue: totalRevenueAgg._sum.totalAmount || 0,
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts
      },
      recentOrders
    })
  })
)
