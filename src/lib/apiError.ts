/**
 * Shared API error handling utilities.
 *
 * Single source of truth for extracting human-readable messages from
 * backend errors. All mutation hooks should use getApiErrorMessage()
 * in their onError callbacks for consistent, informative feedback.
 *
 * Usage:
 *   import { getApiErrorMessage, validateFileSize } from "@/lib/apiError";
 *
 *   onError: (error) => toast.error(getApiErrorMessage(error, "Fallback message"))
 *
 *   const err = validateFileSize(file);
 *   if (err) { toast.error(err); return; }
 */

import axios from "axios";

// ── File size constants ───────────────────────────────────────
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Client-side file size guard — call this BEFORE uploading.
 * Returns a user-friendly error string if the file exceeds the limit,
 * or null if the file is acceptable.
 */
export function validateFileSize(
  file: File,
  maxBytes: number = MAX_FILE_BYTES,
): string | null {
  if (file.size > maxBytes) {
    const limitMB = maxBytes / 1024 / 1024;
    return `"${file.name}" is too large. Maximum allowed size is ${limitMB} MB.`;
  }
  return null;
}

/**
 * Extracts the most relevant, human-readable error message from any
 * API error response. Handles multiple .NET backend response shapes.
 *
 * Priority order:
 *  1. Server-supplied message from response body
 *  2. First validation field error
 *  3. HTTP status-based message
 *  4. Network / CORS failure
 *  5. Provided fallback string
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return fallback;
  }

  // Network failure — no response received (offline, CORS, server down)
  if (!error.response) {
    return "Network error. Please check your connection and try again.";
  }

  const { status, data } = error.response;

  // ── Server-provided message extraction ───────────────────────
  // Handles several common .NET / ASP.NET Core response shapes:
  //   { message: "..." }
  //   { Message: "..." }
  //   { Messages: ["..."] }
  //   { errors: ["..."] }   ← string array
  //   { errors: { Field: ["..."] } }  ← validation dictionary
  const serverMessage: string | undefined | false =
    data?.message ||
    data?.Message ||
    (Array.isArray(data?.Messages) && data.Messages[0]) ||
    (Array.isArray(data?.errors) &&
      typeof data.errors[0] === "string" &&
      data.errors[0]) ||
    (data?.errors &&
      typeof data.errors === "object" &&
      !Array.isArray(data.errors) &&
      Object.values(data.errors as Record<string, string[]>)[0]?.[0]);

  if (serverMessage) return String(serverMessage);

  // ── HTTP status-based fallback messages ──────────────────────
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 408:
      return "Request timed out. Please try again.";
    case 413:
      return `File is too large. Please upload files smaller than ${MAX_FILE_SIZE_MB} MB.`;
    case 422:
      return "Validation failed. Please check your input.";
    case 429:
      return "Too many requests. Please slow down and try again shortly.";
    case 500:
      return "A server error occurred. Please try again later.";
    case 502:
    case 503:
      return "The server is temporarily unavailable. Please try again later.";
    default:
      return fallback;
  }
}
