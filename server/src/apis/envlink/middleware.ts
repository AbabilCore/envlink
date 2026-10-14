import { timingSafeEqual } from "crypto";
import ENV from "@/config";
import { EnvLinkModel } from "./model";
import { isExpired, isValidEnvLinkId, auth } from "@/shared";
import { catchAsync, AppError } from "@/helpers";
import { HTTP_CODE } from "@/constants";

const unAuthMsg = "EnvLink not found or access denied";

export const verifyEnvLinkPassword = catchAsync(async (req, res, next) => {
  const { passwordProof } = req.body || {};
  const envlinkId = req.params.id as string;

  if (!isValidEnvLinkId(envlinkId))
    throw new AppError(HTTP_CODE.BAD_REQUEST, "Invalid EnvLink ID format");

  const envLink = await EnvLinkModel.findOne({ id: envlinkId });

  if (!envLink || isExpired(envLink.expiresAt))
    throw new AppError(HTTP_CODE.NOT_FOUND, unAuthMsg);

  if (!envLink.passwordHash) {
    if (req.method === "PUT") {
      throw new AppError(
        HTTP_CODE.FORBIDDEN,
        "Operation not supported: Optional-password EnvLinks cannot be updated.",
      );
    }
    return next();
  }

  if (!passwordProof)
    throw new AppError(HTTP_CODE.BAD_REQUEST, "Password proof is required");

  const storedProof = await auth.generateZKProof(
    envLink.passwordHash!,
    envlinkId,
  );

  let isProved = false;

  try {
    const passwordProofBuffer = Buffer.from(passwordProof, "utf8");
    const storedPasswordProofBuffer = Buffer.from(storedProof, "utf8");

    if (passwordProofBuffer.length === storedPasswordProofBuffer.length) {
      isProved = timingSafeEqual(
        passwordProofBuffer,
        storedPasswordProofBuffer,
      );
    }
  } catch {
    isProved = false;
  }

  if (!isProved) throw new AppError(HTTP_CODE.UNAUTHORIZED, unAuthMsg);

  return next();
});

export const verifyCronSecret = catchAsync(async (req, res, next) => {
  if (!ENV.CRON_SECRET) {
    return next();
  }

  const cronSecret = req.headers["x-cron-secret"] as string;

  if (!cronSecret) {
    throw new AppError(HTTP_CODE.UNAUTHORIZED, "Missing X-Cron-Secret header");
  }

  if (cronSecret !== ENV.CRON_SECRET) {
    throw new AppError(HTTP_CODE.FORBIDDEN, "Invalid cron secret");
  }

  return next();
});
