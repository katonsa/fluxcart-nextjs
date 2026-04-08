import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requirePermission } from "@/lib/api/middleware"
import { productService } from "@/lib/modules/products/product.service"
import { InventoryUpdateSchema } from "@/lib/modules/products/product.schema"

type Params = Promise<{ id: string }>

export const PATCH = withErrorHandler(
  requirePermission("product", ["manage-inventory"])(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    const body = await req.json()
    const data = InventoryUpdateSchema.parse(body)
    const product = await productService.updateInventory(id, data)
    return ok(product)
  })
)
