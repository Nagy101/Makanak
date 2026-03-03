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
