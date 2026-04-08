import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { categoryService } from "@/lib/modules/categories/category.service"

type Params = Promise<{ slug: string }>

export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Params }) => {
  const { slug } = await params
  const category = await categoryService.getBySlug(slug)
  return ok(category)
})
