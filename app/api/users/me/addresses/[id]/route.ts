import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAuth } from "@/lib/api/middleware"
import { userService } from "@/lib/modules/users/user.service"
import { UpdateAddressSchema } from "@/lib/modules/users/user.schema"

type Params = Promise<{ id: string }>

export const PATCH = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    const body = await req.json()
    const data = UpdateAddressSchema.parse(body)
    const address = await userService.updateAddress(ctx.user.id, id, data)
    return ok(address)
  })
)

export const DELETE = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    await userService.deleteAddress(ctx.user.id, id)
    return ok({ success: true })
  })
)
