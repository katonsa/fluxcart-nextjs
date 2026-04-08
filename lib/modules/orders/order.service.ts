import { db } from "@/lib/db"
import { redis, RedisKeys } from "@/lib/redis"
import { ApiError } from "@/lib/api/errors"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  AdminOrderListQuery,
  AdminUpdateOrderStatusInput,
  CreateOrderInput,
} from "./order.schema"

export class OrderService {
  async create(userId: string, data: CreateOrderInput) {
    const address = await db.address.findFirst({
      where: { id: data.addressId, userId }
    })
    if (!address) throw ApiError.notFound("Address not found or unauthorized")

    const { order, affectedSlugs } = await db.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      })

      if (!cart || cart.items.length === 0) {
        throw ApiError.badRequest("Cannot create order from an empty cart")
      }

      const productIds = cart.items.map((item) => item.productId)
      await tx.$queryRaw(
        Prisma.sql`
          SELECT id
          FROM "products"
          WHERE id IN (${Prisma.join(productIds)})
          FOR UPDATE
        `,
      )

      const lockedProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      })

      const productsById = new Map(lockedProducts.map((product) => [product.id, product]))
      let totalAmount = new Prisma.Decimal(0)

      for (const item of cart.items) {
        const product = productsById.get(item.productId)

        if (!product || !product.isActive) {
          throw ApiError.badRequest(`Product is unavailable: ${item.product.name}`)
        }

        if (item.quantity > product.stock) {
          throw ApiError.badRequest(`Insufficient stock for product: ${product.name}`)
        }

        totalAmount = totalAmount.plus(product.price.mul(item.quantity))
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: data.addressId,
          totalAmount,
          notes: data.notes,
          status: "PENDING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              productName: item.product.name,
              productImage: item.product.imageUrls[0] || null,
            })),
          },
        },
        include: { items: true, address: true },
      })

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })

      return {
        order: newOrder,
        affectedSlugs: cart.items.map((item) => item.product.slug),
      }
    })

    await this.invalidateProductCaches(affectedSlugs)
    return order
  }

  async list(userId: string) {
    return db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })
  }

  async getById(userId: string, orderId: string) {
    const order = await db.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true, address: true },
    })
    if (!order) throw ApiError.notFound("Order")
    return order
  }

  async cancel(userId: string, orderId: string) {
    const { order, affectedSlugs } = await db.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true }
      })

      if (!order) throw ApiError.notFound("Order")

      if (order.status !== "PENDING") {
        throw ApiError.badRequest("Only pending orders can be cancelled")
      }

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      })

      const affectedProducts = await tx.product.findMany({
        where: { id: { in: order.items.map((item) => item.productId) } },
        select: { slug: true },
      })

      return {
        order: updatedOrder,
        affectedSlugs: affectedProducts.map((product) => product.slug),
      }
    })

    await this.invalidateProductCaches(affectedSlugs)
    return order
  }

  async adminList(query: AdminOrderListQuery) {
    return db.order.findMany({
      where: query.status ? { status: query.status } : {},
      orderBy: { createdAt: "desc" },
      take: query.limit || 50,
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async adminGetById(orderId: string) {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, address: true, user: { select: { name: true, email: true } } },
    })
    if (!order) throw ApiError.notFound("Order")
    return order
  }

  async adminUpdateStatus(orderId: string, data: AdminUpdateOrderStatusInput) {
    return db.order.update({
      where: { id: orderId },
      data: { status: data.status },
    })
  }

  private async invalidateProductCaches(slugs: string[]) {
    const uniqueSlugs = [...new Set(slugs)]

    await Promise.all([
      this.invalidateProductListCaches(),
      ...(uniqueSlugs.length > 0 ? [redis.del(...uniqueSlugs.map((slug) => RedisKeys.product(slug)))] : []),
    ])
  }

  private async invalidateProductListCaches() {
    const keys = await redis.keys("fluxcart:products:list:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}

export const orderService = new OrderService()
