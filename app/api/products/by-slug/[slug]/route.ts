import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { productService } from "@/lib/modules/products/product.service"

type Params = Promise<{ slug: string }>

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { slug } = await params
  const product = await productService.getBySlug(slug)
  return ok(product)
})
