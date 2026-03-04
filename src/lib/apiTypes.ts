/**
 * Unified Backend API Response structure.
 *
 * ALL backend endpoints return this exact shape — for both success and error
 * responses. Feature-specific response types (BookingApiResponse, etc.) are
 * kept for backwards compatibility, but they all conform to this contract.
 *
 * Success example:
 *   { statusCode: 200, isSuccess: true,  message: "Booking created", data: { ... }, errors: null }
 *
 * Error example:
 *   { statusCode: 400, isSuccess: false, message: "Email is already in use", data: null, errors: ["..."] }
 */
export interface UnifiedApiResponse<T = null> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

/**
 * Structured API error thrown by the global Axios response interceptor.
 *
 * Any non-success API response (HTTP error OR `isSuccess === false` with a 2xx
 * status) is normalised into this class so that every `onError` callback in the
 * app receives the same predictable shape.
 *
 * Usage in hooks:
 *   onError: (error) => toast.error(getApiErrorMessage(error))
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly isSuccess = false as const;
  readonly errors: string[] | null;

  constructor(
    statusCode: number,
    message: string,
    errors: string[] | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// ── Helpers ───────────────────────────────────────────────────

/**
 * Type guard: ASP.NET ValidationProblemDetails `errors` field —
 * a dictionary mapping field names to arrays of messages.
 *
 *   { "Email": ["Email is already in use"], "Password": ["Too short"] }
 */
function isDictionaryErrors(
  value: unknown,
): value is Record<string, string[]> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  return Object.values(value as Record<string, unknown>).every((v) =>
    Array.isArray(v),
  );
}

/**
 * Flatten a ValidationProblemDetails `errors` dictionary into a
 * single `string[]` containing every individual message.
 */
function flattenDictionaryErrors(
  dict: Record<string, string[]>,
): string[] {
  return Object.entries(dict).flatMap(([, messages]) => messages);
}

/**
 * Parse any Axios `response.data` payload into a normalised
 * `{ message, errors }` pair regardless of shape.
 *
 * Shape 1 — Custom ApiResponse:
 *   { statusCode, isSuccess, message, data, errors: string[] | null }
 *
 * Shape 2 — ASP.NET ValidationProblemDetails:
 *   { type, title, status, errors: { Field: ["msg", …] } }
 */
export function parseApiError(
  data: unknown,
  fallbackStatus: number = 0,
): { statusCode: number; message: string; errors: string[] | null } {
  if (data == null || typeof data !== "object") {
    return {
      statusCode: fallbackStatus,
      message: "An unexpected error occurred.",
      errors: null,
    };
  }

  const obj = data as Record<string, unknown>;

  // Shape 2: ValidationProblemDetails (check first — more specific)
  if (isDictionaryErrors(obj.errors)) {
    const flat = flattenDictionaryErrors(
      obj.errors as Record<string, string[]>,
    );
    return {
      statusCode: (obj.status as number) ?? fallbackStatus,
      message:
        (obj.title as string) ||
        flat[0] ||
        "Validation failed.",
      errors: flat.length ? flat : null,
    };
  }

  // Shape 1: Custom ApiResponse
  return {
    statusCode: (obj.statusCode as number) ?? fallbackStatus,
    message: (obj.message as string) || "Something went wrong.",
    errors: Array.isArray(obj.errors) ? (obj.errors as string[]) : null,
  };
}
