import { AppError } from "@/helpers/app-error";
import { ENVLINK_CONSTANTS, HTTP_CODE } from "@/constants";
import { EnvLinkModel } from "./model";
import * as shared from "@/shared";
import * as interfaces from "./interface";
import * as statsService from "@/apis/stats/service";

export const findEnvLinkById = async (
  id: string,
): Promise<interfaces.IEnvLinkDocument | null> => {
  return await EnvLinkModel.findOne({ id });
};

export const createOptionalPassEnvLink = async (request: {
  encryptedData: string;
  reference?: string;
  filesCount: number;
}) => {
  const { encryptedData, reference, filesCount } = request;

  if (reference) {
    throw new Error(
      "References are not supported for optional-password EnvLinks",
    );
  }

  const payloadSize = Buffer.byteLength(encryptedData, "utf8");

  if (payloadSize > ENVLINK_CONSTANTS.MAX_ENCRYPTED_PAYLOAD_SIZE) {
    throw new Error(
      `Encrypted payload exceeds maximum size of ${ENVLINK_CONSTANTS.MAX_ENCRYPTED_PAYLOAD_SIZE} bytes`,
    );
  }

  const id = shared.generateEnvLinkId();
  const expiresAt = shared.calculateExpirationDate("1h")!;

  const envLink = new EnvLinkModel({
    id,
    encryptedData,
    expiresAt,
    filesCount,
    installCount: 0,
  });

  await envLink.save();
  setImmediate(() => statsService.incrementCreated());

  return {
    id,
    baseId: id,
    expiresAt,
    estimatedFileCount: filesCount,
  };
};

export const createPasswordProtectedEnvLink = async (request: {
  encryptedData: string;
  passwordHash: string;
  expirationDuration?: string;
  reference?: string;
  filesCount: number;
}) => {
  const {
    encryptedData,
    passwordHash,
    expirationDuration,
    reference,
    filesCount,
  } = request;

  const payloadSize = Buffer.byteLength(encryptedData, "utf8");

  if (payloadSize > ENVLINK_CONSTANTS.MAX_ENCRYPTED_PAYLOAD_SIZE) {
    throw new Error(
      `Encrypted payload exceeds maximum size of ${ENVLINK_CONSTANTS.MAX_ENCRYPTED_PAYLOAD_SIZE} bytes`,
    );
  }

  const id = shared.generateEnvLinkId();
  const expiresAt = shared.calculateExpirationDate(
    expirationDuration || ENVLINK_CONSTANTS.DEFAULT_EXPIRATION,
  );

  const envLink = new EnvLinkModel({
    id,
    encryptedData,
    passwordHash,
    expiresAt,
    filesCount,
    reference,
    installCount: 0,
  });

  await envLink.save();
  setImmediate(() => statsService.incrementCreated());

  return {
    id,
    baseId: id,
    expiresAt,
    estimatedFileCount: filesCount,
  };
};

export const getEnvLink = async (id: string) => {
  const envLink = await EnvLinkModel.findOne({ id });

  if (!envLink) {
    return null;
  }

  return {
    id: envLink.id,
    expiresAt: envLink.expiresAt,
    createdAt: envLink.createdAt,
    encryptedData: envLink.encryptedData,
    passwordHash: envLink.passwordHash,
  };
};

export const installEnvLink = async (id: string) => {
  const envLink = await EnvLinkModel.findOne({ id });

  if (!envLink) {
    throw new AppError(HTTP_CODE.NOT_FOUND, "Invalid EnvLink ID");
  }

  envLink.installCount += 1;
  await envLink.save();
  setImmediate(() => statsService.incrementInstalled());

  return {
    encryptedData: envLink.encryptedData,
  };
};

export const updateEnvLink = async (
  id: string,
  request: Omit<interfaces.IUpdateEnvLinkRequest, "currentPassword">,
): Promise<{ id: string; expiresAt: Date | null }> => {
  const envLink = await EnvLinkModel.findOne({ id });

  if (!envLink) {
    throw new AppError(HTTP_CODE.NOT_FOUND, "Invalid EnvLink ID");
  }

  return updateEnvLinkDocument(envLink, request);
};

export const updateEnvLinkDocument = async (
  envLink: interfaces.IEnvLinkDocument,
  request: Omit<interfaces.IUpdateEnvLinkRequest, "currentPassword">,
): Promise<{ id: string; expiresAt: Date | null }> => {
  const {
    encryptedData,
    expirationDuration,
    passwordHash,
    reference,
    filesCount,
  } = request;

  if (encryptedData) {
    const payloadSize = Buffer.byteLength(encryptedData, "utf8");
    if (payloadSize > ENVLINK_CONSTANTS.MAX_ENCRYPTED_PAYLOAD_SIZE) {
      throw new Error(
        `Encrypted payload exceeds maximum size of ${ENVLINK_CONSTANTS.MAX_ENCRYPTED_PAYLOAD_SIZE} bytes`,
      );
    }
    envLink.encryptedData = encryptedData;

    if (filesCount !== undefined) {
      envLink.filesCount = filesCount;
    }
  }

  if (expirationDuration) {
    envLink.expiresAt = shared.calculateExpirationDate(expirationDuration);
  }

  if (passwordHash) {
    envLink.passwordHash = passwordHash;
  }

  if (reference !== undefined) {
    envLink.reference = reference;
  }

  await envLink.save();

  return {
    id: envLink.id,
    expiresAt: envLink.expiresAt,
  };
};

export const expireEnvLink = async (id: string): Promise<void> => {
  const envLink = await EnvLinkModel.findOne({ id });

  if (!envLink) {
    throw new AppError(HTTP_CODE.NOT_FOUND, "Invalid EnvLink ID");
  }

  await envLink.deleteOne();
  setImmediate(() => statsService.incrementExpired());
};

export const cleanupExpiredEnvLinks = async (): Promise<{
  deletedCount: number;
}> => {
  const currentDate = new Date();

  const result = await EnvLinkModel.deleteMany({
    expiresAt: { $lte: currentDate },
  });

  const deletedCount = result.deletedCount || 0;
  if (deletedCount > 0) {
    setImmediate(() => statsService.incrementExpiredBulk(deletedCount));
  }

  return { deletedCount };
};
