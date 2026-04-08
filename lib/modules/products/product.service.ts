import { db } from "@/lib/db"
import { redis, RedisKeys, RedisTTL } from "@/lib/redis"
import { ApiError } from "@/lib/api/errors"
import { slugify } from "@/lib/utils/slugify"
import { logger } from "@/lib/logger"
import { ProductQuerySchema, type CreateProductInput, type UpdateProductInput, type ProductQuery, type InventoryUpdateInput } from "./product.schema"
import { Prisma } from "@/lib/generated/prisma/client"

export class ProductService {
  async list(queryInput: ProductQuery) {
    const query = ProductQuerySchema.parse(queryInput)
    const queryFingerprint = JSON.stringify(query)
    const cacheKey = RedisKeys.productList(queryFingerprint)
    const cached = await redis.get(cacheKey)

    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        logger.error({ err: e }, "Failed to parse cached product list")
      }
    }

    const { page, limit, category, search, minPrice, maxPrice, inStock, sortBy } = query
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
      isActive: true, // Only show active products to public
    }

    if (category) {
      where.category = { slug: category }
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalFilter<"Product"> = {}
      if (minPrice !== undefined) priceFilter.gte = minPrice
      if (maxPrice !== undefined) priceFilter.lte = maxPrice
      where.price = priceFilter
    }
    if (inStock) {
      where.stock = { gt: 0 }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" }
    if (sortBy === "price_asc") orderBy = { price: "asc" }
    else if (sortBy === "price_desc") orderBy = { price: "desc" }

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true }
      })
    ])

    const result = {
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }

    await redis.setex(cacheKey, RedisTTL.productList, JSON.stringify(result))
    return result
  }

  async getBySlug(slug: string) {
    const cacheKey = RedisKeys.product(slug)
    const cached = await redis.get(cacheKey)

    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
         logger.error({ err: e }, "Failed to parse cached product")
      }
    }

    const product = await db.product.findUnique({
      where: { slug },
      include: { category: true }
    })

    if (!product || !product.isActive) {
      throw ApiError.notFound("Product")
    }

    await redis.setex(cacheKey, RedisTTL.product, JSON.stringify(product))
    return product
  }

  async create(data: CreateProductInput) {
    const slug = slugify(data.name)

    const existing = await db.product.findFirst({
      where: { slug }
    })

    if (existing) {
      throw ApiError.conflict("A product with a similar name already exists")
    }

    // Ensure category exists
    const category = await db.category.findUnique({ where: { id: data.categoryId } })
    if (!category) throw ApiError.badRequest("Selected category does not exist")

    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        imageUrls: data.imageUrls || [],
        categoryId: data.categoryId,
        isActive: data.isActive,
      }
    })

    await this.invalidateListCaches()
    return product
  }

  async update(id: string, data: UpdateProductInput) {
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) throw ApiError.notFound("Product")

    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      slug = slugify(data.name)
      const slugConflict = await db.product.findFirst({
        where: { slug, id: { not: id } }
      })
      if (slugConflict) throw ApiError.conflict("A product with a similar name already exists")
    }

    if (data.categoryId) {
      const category = await db.category.findUnique({ where: { id: data.categoryId } })
      if (!category) throw ApiError.badRequest("Selected category does not exist")
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        imageUrls: data.imageUrls,
        categoryId: data.categoryId,
        isActive: data.isActive,
      }
    })

    await Promise.all([
      this.invalidateListCaches(),
      redis.del(RedisKeys.product(existing.slug)),
      redis.del(RedisKeys.product(slug))
    ])

    return product
  }

  async softDelete(id: string) {
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) throw ApiError.notFound("Product")

    await db.product.update({
      where: { id },
      data: { isActive: false }
    })

    await Promise.all([
      this.invalidateListCaches(),
      redis.del(RedisKeys.product(existing.slug))
    ])
  }

  async updateInventory(id: string, data: InventoryUpdateInput) {
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) throw ApiError.notFound("Product")

    const product = await db.product.update({
      where: { id },
      data: { stock: data.stock }
    })

    await Promise.all([
      this.invalidateListCaches(),
      redis.del(RedisKeys.product(product.slug))
    ])

    return product
  }

  private async invalidateListCaches() {
    // In a prod environment we might use tags or cache eviction policies.
    // Here we find all keys matching the list pattern and delete them.
    const keys = await redis.keys("fluxcart:products:list:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}

export const productService = new ProductService()
