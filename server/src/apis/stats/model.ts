import { model, Schema } from "mongoose";
import type { IStatsDocument } from "./interface";

const StatsSchema = new Schema<IStatsDocument>(
  {
    total_created: {
      type: Number,
      required: true,
      default: 0,
    },
    total_installed: {
      type: Number,
      required: true,
      default: 0,
    },
    total_expired: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const StatsModel = model<IStatsDocument>("Stats", StatsSchema);
