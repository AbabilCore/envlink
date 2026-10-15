import { SITE_URL } from "@/constants";
import type { RequestHandler } from "express";
import * as statsService from "@/apis/stats/service";

export const addDocsLocals: RequestHandler = async (req, res, next) => {
  res.locals.absoluteUrl = (path = ""): string => {
    try {
      return new URL(path, SITE_URL).toString();
    } catch {
      return path;
    }
  };

  try {
    res.locals.stats = await statsService.getStats();
  } catch {
    res.locals.stats = {
      total_created: 0,
      total_installed: 0,
      total_expired: 0,
    };
  }

  next();
};
