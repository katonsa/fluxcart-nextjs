import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAuth } from "@/lib/api/middleware"
import { userService } from "@/lib/modules/users/user.service"
import { UpdateProfileSchema } from "@/lib/modules/users/user.schema"

export const GET = withErrorHandler(
  requireAuth(async (ctx) => {
    const profile = await userService.getProfile(ctx.user.id)
    return ok(profile)
  })
)

export const PATCH = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest) => {
    const body = await req.json()
    const data = UpdateProfileSchema.parse(body)
    const profile = await userService.updateProfile(ctx.user.id, data)
    return ok(profile)
  })
)
