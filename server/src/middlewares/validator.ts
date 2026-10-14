import { RequestHandler } from "express";
import { z, ZodError } from "zod";
import { AppError } from "@/helpers/app-error";
import { HTTP_CODE } from "@/constants";

export const validateBody = (schema: z.ZodType): RequestHandler => {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError)
        return next(
          new AppError(
            HTTP_CODE.BAD_REQUEST,
            error.issues.map((issue) => issue.message).join(", "),
          ),
        );

      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodType): RequestHandler => {
  return async (req, res, next) => {
    try {
      const validatedParams = await schema.parseAsync(req.params);
      req.params = validatedParams as any;
      next();
    } catch (error) {
      if (error instanceof ZodError)
        return next(
          new AppError(
            HTTP_CODE.BAD_REQUEST,
            error.issues.map((e) => e.message).join(", "),
          ),
        );

      next(error);
    }
  };
};
