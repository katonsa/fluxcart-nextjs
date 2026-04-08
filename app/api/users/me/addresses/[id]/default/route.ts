import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAuth } from "@/lib/api/middleware"
import { userService } from "@/lib/modules/users/user.service"

type Params = Promise<{ id: string }>

export const PATCH = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest, { params }: { params: Params }) => {
    const { id } = await params
    await userService.setDefaultAddress(ctx.user.id, id)
    return ok({ success: true })
  })
)
