import { z } from "zod";

export const CreateEnvLinkSchema = z
  .object({
    encryptedData: z.string().min(1, "Encrypted data is required"),
    passwordHash: z.string().min(1).optional(),
    filesCount: z.number().int().min(1, "Files count must be at least 1"),
    expirationDuration: z
      .string()
      .trim()
      .regex(
        /^(\d+[mhdMy])|never$/,
        "Invalid expiration format. Use: 30m, 24h, 5d, 6M, 1y, never",
      )
      .optional(),
    reference: z.string().min(1).max(100).optional(),
  })
  .refine(
    (data) => {
      if (!data.passwordHash && data.reference) {
        return false;
      }
      return true;
    },
    {
      message: "References are not supported for optional-password EnvLinks",
      path: ["reference"],
    },
  )
  .refine(
    (data) => {
      if (!data.passwordHash && data.expirationDuration && data.expirationDuration !== "1h") {
        return false;
      }
      return true;
    },
    {
      message: "Expiration duration cannot be customized for optional-password EnvLinks (fixed 1h)",
      path: ["expirationDuration"],
    },
  );

export const GetInfoEnvLinkSchema = z
  .object({
    passwordProof: z.string().min(1, "Password proof is required").optional(),
  })
  .optional();

export const InstallEnvLinkSchema = z
  .object({
    passwordProof: z.string().min(1, "Password proof is required").optional(),
  })
  .optional();

export const ExpireEnvLinkSchema = z
  .object({
    passwordProof: z.string().min(1, "Password proof is required").optional(),
  })
  .optional();

export const UpdateEnvLinkSchema = z
  .object({
    encryptedData: z.string().min(1).optional(),
    filesCount: z.number().int().min(1).optional(),
    expirationDuration: z
      .string()
      .trim()
      .regex(
        /^(\d+[mhdMy])|never$/,
        "Invalid expiration format. Use: 30m, 24h, 5d, 6M, 1y, never",
      )
      .optional(),
    passwordHash: z.string().min(1).optional(),
    passwordProof: z.string().min(1, "Password proof is required"),
    reference: z.string().min(1).max(100).optional(),
  })
  .refine(
    (data) =>
      data.encryptedData ||
      data.expirationDuration ||
      data.passwordHash ||
      data.reference,
    {
      message:
        "At least one field (encryptedData, expirationDuration, passwordHash, or reference) must be provided for update",
    },
  );

export const EnvLinkParamsSchema = z.object({
  id: z.string().regex(/^el_[0-9A-Za-z]{16}$/, "Invalid EnvLink ID format (must be 19 characters)"),
});
