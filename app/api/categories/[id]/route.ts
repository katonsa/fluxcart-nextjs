import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requirePermission } from "@/lib/api/middleware"
import { categoryService } from "@/lib/modules/categories/category.service"
import { UpdateCategorySchema } from "@/lib/modules/categories/category.schema"

type Params = Promise<{ id: string }>

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { id: slug } = await params
  const category = await categoryService.getBySlug(slug)
  return ok(category)
})

export const PATCH = withErrorHandler(
  requirePermission("category", ["update"])(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    const body = await req.json()
    const data = UpdateCategorySchema.parse(body)
    const category = await categoryService.update(id, data)
    return ok(category)
  })
)

export const DELETE = withErrorHandler(
  requirePermission("category", ["delete"])(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    await categoryService.delete(id)
    return ok({ success: true })
  })
)
