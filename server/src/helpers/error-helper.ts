import mongoose from "mongoose";

export interface TErrorSources {
  path: string;
  message: string;
}

export interface TGenericErrorResponse {
  status: number;
  message: string;
  errorSources?: TErrorSources[];
}

export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
  return {
    status: 400,
    message: "Invalid MongoDB ObjectID. Please provide a valid id",
  };
};

export const handlerDuplicateError = (err: any): TGenericErrorResponse => {
  const matchedArray = err.message.match(/"([^"]*)"/);

  return {
    status: 400,
    message: `${matchedArray[1]} already exists!!`,
  };
};

export const handlerValidationError = (err: mongoose.Error.ValidationError): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];

  const errors = Object.values(err.errors);

  errors.forEach((errorObject: any) =>
    errorSources.push({
      path: errorObject.path,
      message: errorObject.message,
    }),
  );

  return {
    status: 400,
    message: "Validation Error",
    errorSources,
  };
};

export const handlerZodError = (err: any): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((issue: any) => {
    errorSources.push({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    });
  });

  return {
    status: 400,
    message: "Zod Error",
    errorSources,
  };
};

export const serializeError = (error: unknown) => {
  if (!error || typeof error !== "object") return error;
  const record = error as Record<string, unknown>;
  const cause = record.cause;

  return {
    name: typeof record.name === "string" ? record.name : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
    code: record.code,
    errno: record.errno,
    type: record.type,
    status: record.status,
    cause:
      cause && typeof cause === "object"
        ? {
            name:
              typeof (cause as Record<string, unknown>).name === "string"
                ? (cause as Record<string, unknown>).name
                : undefined,
            message:
              typeof (cause as Record<string, unknown>).message === "string"
                ? (cause as Record<string, unknown>).message
                : undefined,
          }
        : cause,
  };
};
