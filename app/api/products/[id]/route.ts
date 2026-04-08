import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requirePermission } from "@/lib/api/middleware"
import { productService } from "@/lib/modules/products/product.service"
import { UpdateProductSchema } from "@/lib/modules/products/product.schema"

type Params = Promise<{ id: string }>

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { id: slug } = await params
  const product = await productService.getBySlug(slug)
  return ok(product)
})

export const PATCH = withErrorHandler(
  requirePermission("product", ["update"])(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    const body = await req.json()
    const data = UpdateProductSchema.parse(body)
    const product = await productService.update(id, data)
    return ok(product)
  })
)

export const DELETE = withErrorHandler(
  requirePermission("product", ["delete"])(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    await productService.softDelete(id)
    return ok({ success: true })
  })
)
