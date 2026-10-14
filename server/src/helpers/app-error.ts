export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    stack: any = "",
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
