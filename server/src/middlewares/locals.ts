import { SITE_URL } from "@/constants";
import type { RequestHandler } from "express";

export const addLocals: RequestHandler = (req, res, next): void => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.absoluteUrl = (path = ""): string => {
    try {
      return new URL(path, SITE_URL).toString();
    } catch {
      return path;
    }
  };
  next();
};
