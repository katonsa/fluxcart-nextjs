import { NextRequest } from "next/server"
import { ok } from "@/lib/api/response"
import { withErrorHandler } from "@/lib/api/errors"
import { requireAuth } from "@/lib/api/middleware"
import { auth } from "@/lib/auth"
import { ChangePasswordSchema } from "@/lib/modules/users/user.schema"
import { headers } from "next/headers"
import { ApiError } from "@/lib/api/errors"

export const PATCH = withErrorHandler(
  requireAuth(async (ctx, req: NextRequest) => {
    const body = await req.json()
    const data = ChangePasswordSchema.parse(body)
    
    // Change password using better-auth API
    const response = await auth.api.changePassword({
      headers: await headers(),
      body: {
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true,
      }
    })
    
    // Since we throw when using API if it fails, or it returns success
    // Wait, the API might not throw. Let's check success if it's there.
    if ('status' in response && response.status === false) {
      throw ApiError.badRequest("Failed to change password")
    }

    return ok({ success: true })
  })
)
