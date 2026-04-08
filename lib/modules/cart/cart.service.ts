import { db } from "@/lib/db"
import { ApiError } from "@/lib/api/errors"
import { redis, RedisKeys, RedisTTL } from "@/lib/redis"
import type { AddToCartInput, UpdateCartItemInput } from "./cart.schema"
import type { CartItemView, CartView } from "@/lib/types/api"

interface CartIdentifier {
  userId?: string
  sessionId?: string
}

interface GuestCartItem {
  productId: string
  quantity: number
}

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  imageUrls: true,
  isActive: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const

export class CartService {
  async getCart(identifier: CartIdentifier): Promise<CartView> {
    if (identifier.userId) {
      const cacheKey = RedisKeys.userCart(identifier.userId)
      const cached = await redis.get(cacheKey)

      if (cached) {
        return JSON.parse(cached) as CartView
      }

      const cart = await this.getOrCreateUserCart(identifier.userId)
      await redis.setex(cacheKey, RedisTTL.userCart, JSON.stringify(cart))
      return cart
    }

    if (!identifier.sessionId) {
      throw ApiError.badRequest("Cart identifier is required")
    }

    const items = await this.getGuestItems(identifier.sessionId)
    return this.hydrateGuestCart(identifier.sessionId, items)
  }

  async addItem(identifier: CartIdentifier, data: AddToCartInput): Promise<CartView> {
    const product = await this.requireActiveProduct(data.productId)

    if (identifier.userId) {
      const cart = await this.ensureUserCartRecord(identifier.userId)
      const existingItem = await db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: data.productId,
          },
        },
      })

      const newQuantity = (existingItem?.quantity ?? 0) + data.quantity
      if (newQuantity > product.stock) {
        throw ApiError.badRequest("Not enough stock available")
      }

      if (existingItem) {
        await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        })
      } else {
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: data.productId,
            quantity: data.quantity,
          },
        })
      }

      await this.invalidateCache(identifier)
      return this.getCart(identifier)
    }

    if (!identifier.sessionId) {
      throw ApiError.badRequest("Cart identifier is required")
    }

    const items = await this.getGuestItems(identifier.sessionId)
    const existingItem = items.find((item) => item.productId === data.productId)
    const newQuantity = (existingItem?.quantity ?? 0) + data.quantity

    if (newQuantity > product.stock) {
      throw ApiError.badRequest("Not enough stock available")
    }

    const nextItems = existingItem
      ? items.map((item) =>
          item.productId === data.productId ? { ...item, quantity: newQuantity } : item,
        )
      : [...items, { productId: data.productId, quantity: data.quantity }]

    await this.setGuestItems(identifier.sessionId, nextItems)
    return this.hydrateGuestCart(identifier.sessionId, nextItems)
  }

  async updateItem(
    identifier: CartIdentifier,
    productId: string,
    data: UpdateCartItemInput,
  ): Promise<CartView> {
    const product = await this.requireActiveProduct(productId)

    if (data.quantity > product.stock) {
      throw ApiError.badRequest("Not enough stock available")
    }

    if (identifier.userId) {
      const cart = await this.ensureUserCartRecord(identifier.userId)
      const item = await db.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      })

      if (!item) {
        throw ApiError.notFound("Cart item")
      }

      await db.cartItem.update({
        where: { id: item.id },
        data: { quantity: data.quantity },
      })

      await this.invalidateCache(identifier)
      return this.getCart(identifier)
    }

    if (!identifier.sessionId) {
      throw ApiError.badRequest("Cart identifier is required")
    }

    const items = await this.getGuestItems(identifier.sessionId)
    const existingItem = items.find((item) => item.productId === productId)

    if (!existingItem) {
      throw ApiError.notFound("Cart item")
    }

    const nextItems = items.map((item) =>
      item.productId === productId ? { ...item, quantity: data.quantity } : item,
    )

    await this.setGuestItems(identifier.sessionId, nextItems)
    return this.hydrateGuestCart(identifier.sessionId, nextItems)
  }

  async removeItem(identifier: CartIdentifier, productId: string): Promise<CartView> {
    if (identifier.userId) {
      const cart = await this.ensureUserCartRecord(identifier.userId)
      await db.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
        },
      })

      await this.invalidateCache(identifier)
      return this.getCart(identifier)
    }

    if (!identifier.sessionId) {
      throw ApiError.badRequest("Cart identifier is required")
    }

    const items = await this.getGuestItems(identifier.sessionId)
    const nextItems = items.filter((item) => item.productId !== productId)
    await this.setGuestItems(identifier.sessionId, nextItems)
    return this.hydrateGuestCart(identifier.sessionId, nextItems)
  }

  async clearCart(identifier: CartIdentifier): Promise<CartView> {
    if (identifier.userId) {
      const cart = await this.ensureUserCartRecord(identifier.userId)
      await db.cartItem.deleteMany({ where: { cartId: cart.id } })
      await this.invalidateCache(identifier)
      return this.getCart(identifier)
    }

    if (!identifier.sessionId) {
      throw ApiError.badRequest("Cart identifier is required")
    }

    await this.setGuestItems(identifier.sessionId, [])
    return this.hydrateGuestCart(identifier.sessionId, [])
  }

  async mergeCarts(sessionId: string, userId: string): Promise<CartView> {
    const guestItems = await this.getGuestItems(sessionId)
    if (guestItems.length === 0) {
      return this.getCart({ userId })
    }

    const cart = await this.ensureUserCartRecord(userId)

    await db.$transaction(async (tx) => {
      for (const item of guestItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })

        if (!product || !product.isActive) {
          continue
        }

        const existingItem = await tx.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: item.productId,
            },
          },
        })

        const mergedQuantity = (existingItem?.quantity ?? 0) + item.quantity
        if (mergedQuantity > product.stock) {
          throw ApiError.badRequest(`Not enough stock available for ${product.name}`)
        }

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: mergedQuantity },
          })
        } else {
          await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          })
        }
      }
    })

    await Promise.all([
      this.invalidateCache({ userId }),
      redis.del(RedisKeys.guestCart(sessionId)),
    ])

    return this.getCart({ userId })
  }

  private async getOrCreateUserCart(userId: string): Promise<CartView> {
    const cart = await this.ensureUserCartRecord(userId)
    return this.hydrateDbCart(cart.id, userId)
  }

  private async ensureUserCartRecord(userId: string) {
    const existingCart = await db.cart.findUnique({ where: { userId } })
    if (existingCart) {
      return existingCart
    }

    return db.cart.create({
      data: { userId },
    })
  }

  private async hydrateDbCart(cartId: string, userId: string): Promise<CartView> {
    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            product: {
              select: productSelect,
            },
          },
        },
      },
    })

    return {
      id: cart?.id ?? userId,
      userId,
      items:
        cart?.items
          .filter((item) => item.product.isActive)
          .map((item) => ({
            id: item.productId,
            productId: item.productId,
            quantity: item.quantity,
            product: item.product,
          })) ?? [],
    }
  }

  private async hydrateGuestCart(sessionId: string, items: GuestCartItem[]): Promise<CartView> {
    if (items.length === 0) {
      return {
        id: sessionId,
        userId: null,
        items: [],
      }
    }

    const products = await db.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      select: productSelect,
    })

    const productsById = new Map(products.map((product) => [product.id, product]))
    const hydratedItems: CartItemView[] = []

    for (const item of items) {
      const product = productsById.get(item.productId)
      if (!product || !product.isActive) {
        continue
      }

      hydratedItems.push({
        id: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        product,
      })
    }

    return {
      id: sessionId,
      userId: null,
      items: hydratedItems,
    }
  }

  private async requireActiveProduct(productId: string) {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: productSelect,
    })

    if (!product || !product.isActive) {
      throw ApiError.notFound("Product")
    }

    return product
  }

  private async getGuestItems(sessionId: string): Promise<GuestCartItem[]> {
    const cached = await redis.get(RedisKeys.guestCart(sessionId))
    if (!cached) {
      return []
    }

    try {
      return JSON.parse(cached) as GuestCartItem[]
    } catch {
      await redis.del(RedisKeys.guestCart(sessionId))
      return []
    }
  }

  private async setGuestItems(sessionId: string, items: GuestCartItem[]) {
    await redis.setex(RedisKeys.guestCart(sessionId), RedisTTL.guestCart, JSON.stringify(items))
  }

  private async invalidateCache(identifier: CartIdentifier) {
    if (!identifier.userId) {
      return
    }

    await redis.del(RedisKeys.userCart(identifier.userId))
  }
}

export const cartService = new CartService()
