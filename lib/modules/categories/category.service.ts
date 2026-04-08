import { db } from "@/lib/db"
import { redis, RedisKeys, RedisTTL } from "@/lib/redis"
import { ApiError } from "@/lib/api/errors"
import { slugify } from "@/lib/utils/slugify"
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.schema"
import { logger } from "@/lib/logger"

export class CategoryService {
  async list() {
    const cacheKey = RedisKeys.categoryList()
    const cached = await redis.get(cacheKey)

    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        logger.error({ err: e }, "Failed to parse cached categories")
      }
    }

    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    })

    await redis.setex(cacheKey, RedisTTL.categoryList, JSON.stringify(categories))
    return categories
  }

  async getBySlug(slug: string) {
    const category = await db.category.findUnique({
      where: { slug },
    })

    if (!category) {
      throw ApiError.notFound("Category")
    }

    return category
  }

  async create(data: CreateCategoryInput) {
    const slug = slugify(data.name)

    const existing = await db.category.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    })

    if (existing) {
      throw ApiError.conflict("A category with this name already exists")
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
      },
    })

    await this.invalidateCache()
    return category
  }

  async update(id: string, data: UpdateCategoryInput) {
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      throw ApiError.notFound("Category")
    }

    let slug = existing.slug
    if (data.name && data.name !== existing.name) {
      slug = slugify(data.name)
      const slugConflict = await db.category.findFirst({
        where: { slug, id: { not: id } },
      })
      if (slugConflict) {
        throw ApiError.conflict("A category with this name already exists")
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description !== undefined ? data.description : undefined,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
      },
    })

    await this.invalidateCache()
    return category
  }

  async delete(id: string) {
    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    })

    if (!category) {
      throw ApiError.notFound("Category")
    }

    if (category._count.products > 0) {
      throw ApiError.conflict("Cannot delete category with associated products.")
    }

    await db.category.delete({ where: { id } })
    await this.invalidateCache()
  }

  private async invalidateCache() {
    await redis.del(RedisKeys.categoryList())
  }
}

export const categoryService = new CategoryService()
