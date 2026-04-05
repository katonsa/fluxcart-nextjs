import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { ApiError } from "@/lib/api/errors"
// import { ac } from "@/lib/auth/permissions"

// ============================================
// TYPES
// ============================================

type Session = typeof auth.$Infer.Session
type User = Session["user"]

export interface AuthContext {
  session: Session
  user: User
}

type ProtectedHandler<T extends unknown[]> = (
  ctx: AuthContext,
  ...args: T
) => Promise<Response>

// ============================================
// GET SESSION HELPER
// ============================================

async function getSession(): Promise<Session | null> {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}

// ============================================
// requireAuth
// Injects { session, user } into handler as first arg
// Throws 401 if not authenticated
// ============================================

export function requireAuth<T extends unknown[]>(
  handler: ProtectedHandler<T>,
) {
  return async (...args: T): Promise<Response> => {
    const session = await getSession()

    if (!session) {
      throw ApiError.unauthorized()
    }

    const user = session.user as User & { banned?: boolean }

    if (user.banned) {
      throw ApiError.forbidden("Your account has been suspended")
    }

    return handler({ session, user }, ...args)
  }
}

// ============================================
// requireAdmin
// Injects { session, user } into handler as first arg
// Throws 401 if not authenticated
// Throws 403 if not admin role
// ============================================

export function requireAdmin<T extends unknown[]>(
  handler: ProtectedHandler<T>,
) {
  return async (...args: T): Promise<Response> => {
    const session = await getSession()

    if (!session) {
      throw ApiError.unauthorized()
    }

    const user = session.user as User & { role?: string; banned?: boolean }

    if (user.banned) {
      throw ApiError.forbidden("Your account has been suspended")
    }

    if (user.role !== "admin") {
      throw ApiError.forbidden()
    }

    return handler({ session, user }, ...args)
  }
}

// ============================================
// requirePermission
// Fine-grained RBAC check using better-auth ac
// Usage: requirePermission("product", ["create"])
// ============================================

export function requirePermission(
  resource: string,
  actions: string[],
) {
  return function <T extends unknown[]>(handler: ProtectedHandler<T>) {
    return async (...args: T): Promise<Response> => {
      const session = await getSession()

      if (!session) {
        throw ApiError.unauthorized()
      }

      const user = session.user as User & { role?: string; banned?: boolean }

      if (user.banned) {
        throw ApiError.forbidden("Your account has been suspended")
      }

      const result = await auth.api.userHasPermission({
        body: {
          userId: user.id,
          permissions: { [resource]: actions } as Record<string, string[]>,
        },
      })

      if (!result.success) {
        throw ApiError.forbidden()
      }

      return handler({ session, user }, ...args)
    }
  }
}