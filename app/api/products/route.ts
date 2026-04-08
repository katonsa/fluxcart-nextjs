import { NextRequest } from "next/server"
import { ok, created } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requirePermission } from "@/lib/api/middleware"
import { productService } from "@/lib/modules/products/product.service"
import { CreateProductSchema, ProductQuerySchema } from "@/lib/modules/products/product.schema"

export const GET = withErrorHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams
  const queryObj = Object.fromEntries(searchParams.entries())
  
  const query = ProductQuerySchema.parse(queryObj)
  const result = await productService.list(query)
  
  // Note: the `ok` response helper assumes ok(data, meta?), so we pass them appropriately.
  return ok(result.data, result.meta)
})

export const POST = withErrorHandler(
  requirePermission("product", ["create"])(async (ctx, req: NextRequest) => {
    const body = await req.json()
    const data = CreateProductSchema.parse(body)
    const product = await productService.create(data)
    return created(product)
  })
)
