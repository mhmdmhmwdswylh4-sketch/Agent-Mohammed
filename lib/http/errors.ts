/**
 * Typed application errors. The api-handler maps these to HTTP responses,
 * so route/service code can `throw new AppError(...)` and stay clean.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "غير مصرّح لك بالوصول") {
    super("UNAUTHORIZED", message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "ليست لديك صلاحية لهذا الإجراء") {
    super("FORBIDDEN", message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "العنصر المطلوب غير موجود") {
    super("NOT_FOUND", message, 404)
  }
}

export class ValidationError extends AppError {
  constructor(message = "البيانات المُدخلة غير صحيحة", details?: unknown) {
    super("VALIDATION_ERROR", message, 422, details)
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = "عدد كبير من المحاولات، الرجاء المحاولة لاحقاً",
    public readonly retryAfterSec?: number,
  ) {
    super("RATE_LIMITED", message, 429)
  }
}

export class ConflictError extends AppError {
  constructor(message = "العنصر موجود بالفعل") {
    super("CONFLICT", message, 409)
  }
}
