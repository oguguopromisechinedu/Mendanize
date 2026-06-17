/**
 * Standardized Error Handling for Mendanize API
 * 
 * All API routes should use these error classes to ensure consistent
 * error responses across the entire application.
 */

export enum ErrorCode {
  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  MISSING_FIELD = "MISSING_FIELD",
  INVALID_INPUT = "INVALID_INPUT",

  // Authentication
  UNAUTHORIZED = "UNAUTHORIZED",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",

  // Authorization
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Resource
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",

  // External Services
  OPENAI_ERROR = "OPENAI_ERROR",
  STRIPE_ERROR = "STRIPE_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",

  // Server
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }

  toJSON(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(ErrorCode.UNAUTHENTICATED, message, 401);
    this.name = "AuthenticationError";
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = "Invalid email or password") {
    super(ErrorCode.INVALID_CREDENTIALS, message, 401);
    this.name = "InvalidCredentialsError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You do not have permission to access this resource") {
    super(ErrorCode.FORBIDDEN, message, 403);
    this.name = "AuthorizationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests. Please try again later.") {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
    this.name = "RateLimitError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(ErrorCode.CONFLICT, message, 409);
    this.name = "ConflictError";
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(
      ErrorCode.EMAIL_ALREADY_EXISTS,
      `An account with email ${email} already exists`,
      409
    );
    this.name = "EmailAlreadyExistsError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(ErrorCode.DATABASE_ERROR, message, 500);
    this.name = "DatabaseError";
  }
}

export class OpenAIError extends AppError {
  constructor(message: string = "Failed to generate content with OpenAI") {
    super(ErrorCode.OPENAI_ERROR, message, 500);
    this.name = "OpenAIError";
  }
}

export class StripeError extends AppError {
  constructor(message: string = "Stripe payment processing failed") {
    super(ErrorCode.STRIPE_ERROR, message, 500);
    this.name = "StripeError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500);
    this.name = "InternalServerError";
  }
}

/**
 * Handle errors consistently in API routes
 * 
 * Usage:
 * ```typescript
 * export async function POST(req: Request) {
 *   try {
 *     // Your logic
 *   } catch (error) {
 *     return handleApiError(error);
 *   }
 * }
 * ```
 */
export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof AppError) {
    return new Response(JSON.stringify(error.toJSON()), {
      status: error.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Unknown error
  const unknownError = new InternalServerError("An unexpected error occurred");
  return new Response(JSON.stringify(unknownError.toJSON()), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
