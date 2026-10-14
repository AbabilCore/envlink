import { StatsModel } from "./model";
import type { IStatsResponse } from "./interface";

export const getStats = async (): Promise<IStatsResponse> => {
  let stats = await StatsModel.findOne();

  if (!stats) {
    stats = await StatsModel.create({
      total_created: 0,
      total_installed: 0,
      total_expired: 0,
    });
  }

  return {
    total_created: stats.total_created,
    total_installed: stats.total_installed,
    total_expired: stats.total_expired,
  };
};

export const incrementCreated = async (): Promise<void> => {
  try {
    await StatsModel.findOneAndUpdate(
      {},
      { $inc: { total_created: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    console.error("Error incrementing created stats:", error);
  }
};

export const incrementInstalled = async (): Promise<void> => {
  try {
    await StatsModel.findOneAndUpdate(
      {},
      { $inc: { total_installed: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    console.error("Error incrementing installed stats:", error);
  }
};

export const incrementExpired = async (): Promise<void> => {
  try {
    await StatsModel.findOneAndUpdate(
      { $expr: { $gt: ["$total_created", "$total_expired"] } },
      { $inc: { total_expired: 1 } },
      { upsert: false },
    );
  } catch (error) {
    console.error("Error incrementing expired stats:", error);
  }
};

export const incrementExpiredBulk = async (count: number): Promise<void> => {
  if (count <= 0) return;

  try {
    await StatsModel.findOneAndUpdate(
      {},
      [
        {
          $set: {
            total_expired: {
              $min: [{ $add: ["$total_expired", count] }, "$total_created"],
            },
          },
        },
      ],
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    console.error("Error incrementing bulk expired stats:", error);
  }
};

export const resetStats = async (): Promise<IStatsResponse> => {
  const stats = await StatsModel.findOneAndUpdate(
    {},
    {
      total_created: 0,
      total_installed: 0,
      total_expired: 0,
    },
    { upsert: true, returnDocument: "after" },
  );

  return {
    total_created: stats.total_created,
    total_installed: stats.total_installed,
    total_expired: stats.total_expired,
  };
};
