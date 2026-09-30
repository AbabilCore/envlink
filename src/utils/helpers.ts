import * as types from "@/types";

export function formatTimeForUser(utcTime: string | null): string {
  if (!utcTime) return "Never";

  const date = new Date(utcTime);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
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
