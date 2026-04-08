import { NextRequest } from "next/server"
import { ok, created } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requirePermission } from "@/lib/api/middleware"
import { categoryService } from "@/lib/modules/categories/category.service"
import { CreateCategorySchema } from "@/lib/modules/categories/category.schema"

export const GET = withErrorHandler(async () => {
  const categories = await categoryService.list()
  return ok(categories)
})

export const POST = withErrorHandler(
  requirePermission("category", ["create"])(async (ctx, req: NextRequest) => {
    const body = await req.json()
    const data = CreateCategorySchema.parse(body)
    const category = await categoryService.create(data)
    return created(category)
  })
)
