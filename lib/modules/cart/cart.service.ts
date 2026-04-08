import { db } from "@/lib/db"
import { ApiError } from "@/lib/api/errors"
import { redis, RedisKeys, RedisTTL } from "@/lib/redis"
import type { AddToCartInput, UpdateCartItemInput } from "./cart.schema"

export class CartService {
  async getCart(identifier: { userId?: string; cartId?: string }) {
    if (!identifier.userId && !identifier.cartId) {
       const newCart = await db.cart.create({
         data: {},
         include: { items: { include: { product: { select: { id: true, name: true, price: true, imageUrls: true, slug: true, stock: true } } } } }
       })
       return newCart
    }
    
    const isUser = !!identifier.userId
    const id = isUser ? identifier.userId! : identifier.cartId!
    const cacheKey = isUser ? RedisKeys.userCart(id) : RedisKeys.guestCart(id)
    const cached = await redis.get(cacheKey)
    if (cached) {
      try { return JSON.parse(cached) } catch {}
    }

    const where: any = isUser ? { userId: id } : { id }

    let cart = await db.cart.findUnique({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, imageUrls: true, slug: true, stock: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!cart) {
      if (isUser) {
        cart = await db.cart.create({
          data: { userId: id },
          include: { items: { include: { product: { select: { id: true, name: true, price: true, imageUrls: true, slug: true, stock: true } } } } }
        })
      } else {
         throw ApiError.notFound("Cart")
      }
    }

    await redis.setex(cacheKey, isUser ? RedisTTL.userCart : RedisTTL.guestCart, JSON.stringify(cart))
    return cart
  }

  async addItem(identifier: { userId?: string; cartId?: string }, data: AddToCartInput) {
    const cart = await this.getCart(identifier)
    
    const product = await db.product.findUnique({ where: { id: data.productId } })
    if (!product || !product.isActive) {
      throw ApiError.notFound("Product")
    }

    const existingItem = cart.items.find((i: any) => i.productId === data.productId)
    const newQuantity = (existingItem?.quantity || 0) + data.quantity

    if (product.stock < newQuantity) {
      throw ApiError.badRequest("Not enough stock available")
    }

    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      })
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          quantity: data.quantity
        }
      })
    }

    await this.invalidateCache(identifier)
    return this.getCart(identifier)
  }

  async updateItem(identifier: { userId?: string; cartId?: string }, itemId: string, data: UpdateCartItemInput) {
    const cart = await this.getCart(identifier)
    const item = cart.items.find((i: any) => i.id === itemId)
    
    if (!item) {
      throw ApiError.notFound("Cart item")
    }

    if (data.quantity > item.product.stock) {
      throw ApiError.badRequest("Not enough stock available")
    }

    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity }
    })

    await this.invalidateCache(identifier)
    return this.getCart(identifier)
  }

  async removeItem(identifier: { userId?: string; cartId?: string }, itemId: string) {
    const cart = await this.getCart(identifier)
    const item = cart.items.find((i: any) => i.id === itemId)
    
    if (!item) return cart

    await db.cartItem.delete({ where: { id: itemId } })

    await this.invalidateCache(identifier)
    return this.getCart(identifier)
  }

  async clearCart(identifier: { userId?: string; cartId?: string }) {
    const cart = await this.getCart(identifier)
    await db.cartItem.deleteMany({ where: { cartId: cart.id } })
    await this.invalidateCache(identifier)
  }

  async mergeCarts(cartId: string, userId: string) {
    const guestCart = await db.cart.findUnique({
      where: { id: cartId },
      include: { items: true }
    })

    if (!guestCart || guestCart.items.length === 0) {
       return this.getCart({ userId })
    }

    const userCart = await this.getCart({ userId })

    for (const item of guestCart.items) {
      const existing = userCart.items.find((i: any) => i.productId === item.productId)
      
      if (existing) {
         await db.cartItem.update({
           where: { id: existing.id },
           data: { quantity: existing.quantity + item.quantity }
         })
      } else {
         await db.cartItem.update({
           where: { id: item.id },
           data: { cartId: userCart.id }
         })
      }
    }

    await db.cart.delete({ where: { id: guestCart.id } })
    
    await this.invalidateCache({ userId })
    await this.invalidateCache({ cartId })
    
    return this.getCart({ userId })
  }

  private async invalidateCache(identifier: { userId?: string; cartId?: string }) {
    if (!identifier.userId && !identifier.cartId) return
    const isUser = !!identifier.userId
    const id = isUser ? identifier.userId! : identifier.cartId!
    await redis.del(isUser ? RedisKeys.userCart(id) : RedisKeys.guestCart(id))
  }
}

export const cartService = new CartService()
