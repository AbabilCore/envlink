import * as envlinkService from "./service";
import * as helpers from "@/helpers";
import { HTTP_CODE } from "@/constants";

export const create = helpers.catchAsync(async (req, res) => {
  const {
    encryptedData,
    passwordHash,
    expirationDuration,
    reference,
    filesCount,
  } = req.body;

  if (!filesCount || filesCount < 1) {
    throw new helpers.AppError(
      HTTP_CODE.BAD_REQUEST,
      "filesCount is required and must be at least 1",
    );
  }

  let result;

  if (!passwordHash) {
    result = await envlinkService.createOptionalPassEnvLink({
      encryptedData,
      reference,
      filesCount,
    });
  } else {
    result = await envlinkService.createPasswordProtectedEnvLink({
      encryptedData,
      passwordHash,
      expirationDuration,
      reference,
      filesCount,
    });
  }

  helpers.sendResponse(res, {
    success: true,
    status: HTTP_CODE.CREATED,
    message: "EnvLink created successfully",
    data: {
      id: result.id,
      expiresAt: result.expiresAt?.toISOString() || null,
      filesCount: result.estimatedFileCount,
      reference: reference || null,
      createdAt: new Date().toISOString(),
    },
  });
});

export const getInfo = helpers.catchAsync(async (req, res) => {
  const envLink = await envlinkService.findEnvLinkById(req.params.id as string);

  if (!envLink) {
    throw new helpers.AppError(HTTP_CODE.NOT_FOUND, "EnvLink not found");
  }

  helpers.sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "EnvLink retrieved successfully",
    data: {
      id: envLink.id,
      filesCount: envLink.filesCount,
      installCount: envLink.installCount,
      expiresAt: envLink.expiresAt?.toISOString() || null,
      reference: envLink.reference || null,
      createdAt: envLink.createdAt.toISOString(),
      status: "active",
    },
  });
});

export const install = helpers.catchAsync(async (req, res) => {
  const envLink = await envlinkService.findEnvLinkById(req.params.id as string);

  if (!envLink) {
    throw new helpers.AppError(HTTP_CODE.NOT_FOUND, "EnvLink not found");
  }

  const result = await envlinkService.installEnvLink(envLink.id);

  helpers.sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "EnvLink retrieved successfully",
    data: result,
  });
});

export const expire = helpers.catchAsync(async (req, res) => {
  const envLink = await envlinkService.findEnvLinkById(req.params.id as string);

  if (!envLink) {
    throw new helpers.AppError(HTTP_CODE.NOT_FOUND, "EnvLink not found");
  }

  await envlinkService.expireEnvLink(envLink.id);

  helpers.sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "EnvLink expired successfully",
    data: null,
  });
});

export const update = helpers.catchAsync(async (req, res) => {
  const {
    encryptedData,
    expirationDuration,
    passwordHash,
    reference,
    filesCount,
  } = req.body;
  const envLink = await envlinkService.findEnvLinkById(req.params.id as string);

  if (!envLink) {
    throw new helpers.AppError(HTTP_CODE.NOT_FOUND, "EnvLink not found");
  }

  const result = await envlinkService.updateEnvLinkDocument(envLink, {
    encryptedData,
    expirationDuration,
    passwordHash,
    reference,
    filesCount,
  });

  const updatedEnvLink = await envlinkService.findEnvLinkById(
    req.params.id as string,
  );

  helpers.sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "EnvLink updated successfully",
    data: {
      id: result.id,
      expiresAt: result.expiresAt?.toISOString() || null,
      filesCount: updatedEnvLink?.filesCount || envLink.filesCount,
    },
  });
});

export const cronCleanup = helpers.catchAsync(async (req, res) => {
  const result = await envlinkService.cleanupExpiredEnvLinks();

  helpers.sendResponse(res, {
    success: true,
    status: HTTP_CODE.OK,
    message: "Expired EnvLinks cleanup completed",
    data: {
      deletedCount: result.deletedCount,
      cleanupTime: new Date().toISOString(),
    },
  });
});
