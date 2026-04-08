import { db } from "@/lib/db"
import { ApiError } from "@/lib/api/errors"
import type { UpdateProfileInput, AddressInput, UpdateAddressInput } from "./user.schema"

export class UserService {
  async getProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true }
    })
    if (!user) throw ApiError.notFound("User")
    return user
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image
      },
      select: { id: true, name: true, email: true, image: true, role: true }
    })
  }

  // Address Management
  async listAddresses(userId: string) {
    return db.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" }
      ]
    })
  }

  async getAddress(userId: string, addressId: string) {
    const address = await db.address.findUnique({ where: { id: addressId } })
    if (!address || address.userId !== userId) throw ApiError.notFound("Address")
    return address
  }

  async createAddress(userId: string, data: AddressInput) {
    // If this is the first address, make it default automatically
    const count = await db.address.count({ where: { userId } })
    const isDefault = count === 0 ? true : data.isDefault || false

    if (isDefault) {
      // Unset other defaults
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      })
    }

    return db.address.create({
      data: {
        userId,
        ...data,
        isDefault
      }
    })
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressInput) {
    const existing = await this.getAddress(userId, addressId)

    if (data.isDefault && !existing.isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      })
    }
    
    // Prevent un-defaulting if it's the only one
    if (data.isDefault === false && existing.isDefault) {
       const others = await db.address.count({ where: { userId, id: { not: addressId } } })
       if (others === 0) {
          data.isDefault = true // Force it to remain default
       }
    }

    return db.address.update({
      where: { id: addressId },
      data
    })
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.getAddress(userId, addressId)

    // Check for existing orders
    const orderCount = await db.order.count({ where: { addressId } })
    if (orderCount > 0) {
        throw ApiError.conflict("Cannot delete address associated with past orders")
    }

    await db.address.delete({ where: { id: addressId } })

    // If we deleted the default, set another to default
    if (address.isDefault) {
      const nextAddress = await db.address.findFirst({ where: { userId } })
      if (nextAddress) {
        await db.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true }
        })
      }
    }
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.getAddress(userId, addressId) // Verify ownership

    await db.$transaction([
      db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      }),
      db.address.update({
        where: { id: addressId },
        data: { isDefault: true }
      })
    ])
  }
}

export const userService = new UserService()
