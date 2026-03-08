/**
 * Shared API error handling utilities.
 *
 * All error display is driven by the Backend's unified response:
 *   { statusCode, isSuccess, message, data, errors }
 *
 * The global Axios interceptor (see api.ts) normalises every failed
 * response into an ApiError instance, so extracting the message is
 * simply reading error.message — no manual response parsing needed.
 *
 * ── Exports ─────────────────────────────────────────────────
 *  getApiErrorMessage(error)     → primary backend message string
 *  getApiValidationErrors(error) → the errors[] array (or null)
 *  showApiErrorToast(error)      → convenience: toast with message + errors
 *  validateFileSize(file, max)   → client-side file guard
 *
 * Usage:
 *   import { showApiErrorToast } from "@/lib/apiError";
 *   onError: (error) => showApiErrorToast(error)
 *
 *   import { getApiErrorMessage } from "@/lib/apiError";
 *   onError: (error) => toast.error(getApiErrorMessage(error))
 */

import { toast } from "sonner";
import { ApiError } from "./apiTypes";

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

// ── Default fallback — only used when the API provides nothing ─
const FALLBACK_MESSAGE = "An unexpected error occurred.";

/**
 * Extracts the primary error message from any API error.
 *
 * The interceptor guarantees that every rejected API call carries an
 * ApiError whose `.message` is the backend-supplied string. This
 * function simply surfaces that; a generic fallback is used *only*
 * when no message exists at all.
 *
 * DO NOT pass a custom fallback — let the backend speak.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || FALLBACK_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message || FALLBACK_MESSAGE;
  }

  return FALLBACK_MESSAGE;
}

/**
 * Extracts the validation `errors` array from an API error.
 * Returns null when there are no detailed validation errors.
 */
export function getApiValidationErrors(error: unknown): string[] | null {
  if (error instanceof ApiError && error.errors?.length) {
    return error.errors;
  }
  return null;
}

/**
 * Displays an error toast using the backend's message as the title
 * and, when validation errors are present, lists them as description.
 *
 * This is the recommended one-liner for `onError` callbacks:
 *   onError: (error) => showApiErrorToast(error)
 */
export function showApiErrorToast(error: unknown): void {
  const message = getApiErrorMessage(error);
  const errors = getApiValidationErrors(error);

  if (errors?.length) {
    toast.error(message, {
      description: errors.join("\n"),
    });
  } else {
    toast.error(message);
  }
}

