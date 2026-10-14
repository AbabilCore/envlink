import rateLimit from "express-rate-limit";
import { HTTP_CODE } from "@/constants";

export const createEnvLinkLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    status: HTTP_CODE.TOO_MANY_REQUESTS,
    success: false,
    message:
      "Too many envlink creation attempts from this network. Please try again in a minute.",
    data: {
      retryAfter: 60,
      limit: 30,
      window: "1 minute",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_CODE.TOO_MANY_REQUESTS,
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
});

export const normalOperationsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    status: HTTP_CODE.TOO_MANY_REQUESTS,
    success: false,
    message:
      "Too many requests from this network. Please try again in a minute.",
    data: {
      retryAfter: 60,
      limit: 50,
      window: "1 minute",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_CODE.TOO_MANY_REQUESTS,
  skipFailedRequests: false,
});

export const sensitiveOperationsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  message: {
    status: HTTP_CODE.TOO_MANY_REQUESTS,
    success: false,
    message:
      "Too many sensitive operations from this network. Please try again in a minute.",
    data: {
      retryAfter: 60,
      limit: 150,
      window: "1 minute",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: HTTP_CODE.TOO_MANY_REQUESTS,
  skipFailedRequests: true,
});
