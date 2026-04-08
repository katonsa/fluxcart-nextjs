import { ZodError } from "zod"
import {
  badRequest,
  conflict,
  forbidden,
  notFound,
  serverError,
  unauthorized,
  unprocessable,
} from "@/lib/api/response"

// ============================================
// API ERROR CLASS
// ============================================

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }

  // Convenience static constructors
  static badRequest(message: string) {
    return new ApiError(400, message)
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message)
  }

  static forbidden(message = "Insufficient permissions") {
    return new ApiError(403, message)
  }

  static notFound(resource = "Resource") {
    return new ApiError(404, `${resource} not found`)
  }

  static conflict(message: string) {
    return new ApiError(409, message)
  }
}

// ============================================
// GLOBAL ERROR HANDLER
// Wraps any route handler — catches ApiError,
// ZodError, and unexpected errors uniformly
// ============================================

export function withErrorHandler<T extends any[]>(handler: (...args: T) => Promise<Response>): (...args: T) => Promise<Response> {
  return async (...args: T) => {
    try {
      return await handler(...args)
    } catch (err) {
      // Known API errors — throw from service layer
      if (err instanceof ApiError) {
        switch (err.statusCode) {
          case 400: return badRequest(err.message)
          case 401: return unauthorized(err.message)
          case 403: return forbidden(err.message)
          case 404: return notFound(err.message)
          case 409: return conflict(err.message)
          default:  return serverError(err.message)
        }
      }

      // Zod validation errors — thrown from schema.parse()
      if (err instanceof ZodError) {
        const errors = err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
        return unprocessable(errors)
      }

      // Prisma known errors
      if (
        err instanceof Error &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
      ) {
        const code = (err as { code: string }).code

        // Unique constraint violation
        if (code === "P2002") {
          const target = (err as { meta?: { target?: string[] } }).meta?.target
          const field = target?.[0] ?? "field"
          return conflict(`${field} already exists`)
        }

        // Record not found
        if (code === "P2025") {
          return notFound()
        }

        // Foreign key constraint
        if (code === "P2003") {
          return badRequest("Invalid reference — related record does not exist")
        }
      }

      // Unexpected errors — log and return 500
      console.error("[API Error]", err)
      return serverError()
    }
  }
}