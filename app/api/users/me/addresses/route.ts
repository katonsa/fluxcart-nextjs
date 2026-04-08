import { NextRequest } from "next/server"
import { ok, created } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAuth } from "@/lib/api/middleware"
import { userService } from "@/lib/modules/users/user.service"
import { CreateAddressSchema } from "@/lib/modules/users/user.schema"

export const GET = withErrorHandler(
  requireAuth(async (ctx) => {
    const addresses = await userService.listAddresses(ctx.user.id)
    return ok(addresses)
  })
)

export const POST = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest) => {
    const body = await req.json()
    const data = CreateAddressSchema.parse(body)
    const address = await userService.createAddress(ctx.user.id, data)
    return created(address)
  })
)
