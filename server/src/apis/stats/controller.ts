import { catchAsync } from "@/helpers/catch-async";
import { sendResponse } from "@/helpers/send-response";
import { HTTP_CODE } from "@/constants";
import * as statsService from "./service";

export const getStats = catchAsync(async (req, res) => {
  const stats = await statsService.getStats();

  sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "Stats retrieved successfully",
    data: stats,
  });
});