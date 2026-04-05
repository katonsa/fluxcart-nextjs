import { NextResponse } from "next/server"

// ============================================
// TYPES
// ============================================

export interface ApiMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface SuccessResponse<T> {
  success: true
  data: T
  meta?: ApiMeta
}

interface ErrorResponse {
  success: false
  statusCode: number
  message: string
  errors?: FieldError[]
}

interface FieldError {
  field: string
  message: string
}

// ============================================
// SUCCESS RESPONSES
// ============================================

export function ok<T>(data: T, meta?: ApiMeta) {
  const body: SuccessResponse<T> = { success: true, data, ...(meta && { meta }) }
  return NextResponse.json(body, { status: 200 })
}

export function created<T>(data: T) {
  const body: SuccessResponse<T> = { success: true, data }
  return NextResponse.json(body, { status: 201 })
}

// ============================================
// ERROR RESPONSES
// ============================================

export function badRequest(message: string, errors?: FieldError[]) {
  const body: ErrorResponse = {
    success: false,
    statusCode: 400,
    message,
    ...(errors && { errors }),
  }
  return NextResponse.json(body, { status: 400 })
}

export function unauthorized(message = "Authentication required") {
  const body: ErrorResponse = { success: false, statusCode: 401, message }
  return NextResponse.json(body, { status: 401 })
}

export function forbidden(message = "Insufficient permissions") {
  const body: ErrorResponse = { success: false, statusCode: 403, message }
  return NextResponse.json(body, { status: 403 })
}

export function notFound(resource = "Resource") {
  const body: ErrorResponse = {
    success: false,
    statusCode: 404,
    message: `${resource} not found`,
  }
  return NextResponse.json(body, { status: 404 })
}

export function conflict(message: string) {
  const body: ErrorResponse = { success: false, statusCode: 409, message }
  return NextResponse.json(body, { status: 409 })
}

export function unprocessable(errors: FieldError[], message = "Validation failed") {
  const body: ErrorResponse = { success: false, statusCode: 422, message, errors }
  return NextResponse.json(body, { status: 422 })
}

export function serverError(message = "Internal server error") {
  const body: ErrorResponse = { success: false, statusCode: 500, message }
  return NextResponse.json(body, { status: 500 })
}

// ============================================
// PAGINATION HELPER
// ============================================

export function paginate(total: number, page: number, limit: number): ApiMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}