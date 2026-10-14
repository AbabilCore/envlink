import { model, Schema } from "mongoose";
import type { IEnvLinkDocument } from "./interface";

const EnvLinkSchema = new Schema<IEnvLinkDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    encryptedData: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: false,
      index: true,
    },
    filesCount: {
      type: Number,
      required: true,
      default: 1,
    },
    reference: {
      type: String,
      required: false,
    },
    installCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const EnvLinkModel = model<IEnvLinkDocument>("EnvLink", EnvLinkSchema);
