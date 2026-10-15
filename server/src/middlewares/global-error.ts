import ENV from "@/config";
import { AppError, errorHelper, renderWithLayout } from "@/helpers";
import { ErrorRequestHandler } from "express";

export const globalErrorHandler: ErrorRequestHandler = async (
  err,
  req,
  res,
  next,
) => {
  let errorSources: Array<errorHelper.TErrorSources> = [];
  let status = 500;
  let message = "Something went wrong! Please try updating EnvLink.";

  if (
    err.name === "MongoNetworkError" ||
    err.message?.includes("buffering timed out")
  ) {
    status = 503;
    message =
      ENV.NODE_ENV === "production"
        ? "Service temporarily unavailable. Please try again later."
        : "Database connection error";
  } else if (err.name === "MongooseError" || err.name === "MongoError") {
    status = 503;
    message =
      ENV.NODE_ENV === "production"
        ? "Service temporarily unavailable. Please try again later."
        : err.message;
  } else if (err.code === 11000) {
    const simplifiedError = errorHelper.handlerDuplicateError(err);
    status = simplifiedError.status;
    message = simplifiedError.message;
  } else if (err.name === "CastError") {
    const simplifiedError = errorHelper.handleCastError(err);
    status = simplifiedError.status;
    message = simplifiedError.message;
  } else if (err.name === "ZodError") {
    const simplifiedError = errorHelper.handlerZodError(err);
    status = simplifiedError.status;
    message = simplifiedError.message;
    errorSources =
      simplifiedError.errorSources as Array<errorHelper.TErrorSources>;
  } else if (err.name === "ValidationError") {
    const simplifiedError = errorHelper.handlerValidationError(err);
    status = simplifiedError.status;
    errorSources =
      simplifiedError.errorSources as Array<errorHelper.TErrorSources>;
    message = simplifiedError.message;
  } else if (err instanceof AppError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof Error) {
    status = 500;
    message =
      ENV.NODE_ENV === "production" ? "Internal server error" : err.message;
  }

  if (ENV.NODE_ENV === "development") {
    console.error("Error: ", status, " ", err.message || message);
  }

  if (req.path.startsWith("/api")) {
    const response: any = {
      success: false,
      message,
    };

    if (ENV.NODE_ENV === "development") {
      response.errorSources = errorSources;
      response.err = errorHelper.serializeError(err);
      response.stack = err.stack?.split("\n");
    } else if (errorSources.length > 0) {
      response.errorSources = errorSources;
    }

    return res.status(status).json(response);
  }

  renderWithLayout(
    res,
    "pages/error",
    {
      title: "Error",
      description: message,
      canonicalPath: req.path,
      page: "error",
      status,
      error: {
        message,
        statusCode: status,
        stack: ENV.NODE_ENV === "development" ? err.stack : undefined,
      },
    },
    (err) => {
      if (err) {
        res.status(status).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Error</title></head>
            <body>
              <h1>Error ${status}</h1>
              <p>${message}</p>
            </body>
          </html>
        `);
      }
    },
  );
};
