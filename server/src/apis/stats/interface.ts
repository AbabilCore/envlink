import { Document } from "mongoose";

export interface IStats {
  total_created: number;
  total_installed: number;
  total_expired: number;
  updatedAt: Date;
}

export interface IStatsDocument extends IStats, Document {}

export interface IStatsResponse {
  total_created: number;
  total_installed: number;
  total_expired: number;
}