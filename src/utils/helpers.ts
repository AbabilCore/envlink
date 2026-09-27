import * as types from "@/types";

export function formatTimeForUser(utcTime: string | null): string {
  if (!utcTime) return "Never";

  const date = new Date(utcTime);
  return date.toLocaleString("en-US", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const isErrorWithMessage = (
  error: unknown,
): error is types.IErrorWithMessage => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isErrorWithMessage(error)) return error.message;
  return String(error);
};
