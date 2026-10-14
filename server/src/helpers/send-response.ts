import { Response } from "express";

type TMeta =
  | {
      page: number;
      limit: number;
      total: number;
    }
  | Record<string, unknown>;

interface TResponse<T> {
  status: number;
  success: boolean;
  message: string;
  meta?: TMeta;
  data?: T;
}

export const sendResponse = <T>(res: Response, info: TResponse<T>) => {
  res.status(info.status).json({
    status: info.status,
    success: info.success,
    message: info.message,
    meta: info.meta,
    data: info.data,
  });
};
