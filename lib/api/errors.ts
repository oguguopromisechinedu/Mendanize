/**
 * Standardized API errors for Mendanize (MES-002 / API-Standards).
 * Responses always use { data, error, meta } via handleApiError / lib/api/response.
 */

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { logger } from "@/lib/logger";

/** Stable uppercase codes from docs/standards/API-Standards.md */
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  MISSING_FIELD = "MISSING_FIELD",
  INVALID_INPUT = "INVALID_INPUT",

  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",

  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  RATE_LIMITED = "RATE_LIMITED",

  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",

  OPENAI_ERROR = "OPENAI_ERROR",
  STRIPE_ERROR = "STRIPE_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",

  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }

  toApiResponse(): ApiResponse<null> {
    return {
      data: null,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details !== undefined ? { details: this.details } : {}),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(ErrorCode.UNAUTHORIZED, message, 401);
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
    super(ErrorCode.RATE_LIMITED, message, 429);
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

export class NotImplementedError extends AppError {
  constructor(surface: string) {
    super(
      ErrorCode.NOT_IMPLEMENTED,
      `${surface} — not implemented`,
      501
    );
    this.name = "NotImplementedError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(ErrorCode.INTERNAL_ERROR, message, 500);
    this.name = "InternalServerError";
  }
}

/**
 * Map thrown errors to the MES-002 envelope `{ data, error, meta }`.
 */
export function handleApiError(error: unknown) {
  logger.error("API error", {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : undefined,
  });

  if (error instanceof NotImplementedError) {
    const body = error.toApiResponse();
    body.meta = { placeholder: true };
    return NextResponse.json(body, { status: 501 });
  }

  if (error instanceof AppError) {
    return NextResponse.json(error.toApiResponse(), {
      status: error.statusCode,
    });
  }

  const unknownError = new InternalServerError("An unexpected error occurred");
  return NextResponse.json(unknownError.toApiResponse(), { status: 500 });
}
