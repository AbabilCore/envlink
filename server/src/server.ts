import { createServer } from "http";
import mongoose from "mongoose";
import app from "@/app";
import ENV from "@/config";
import { SITE_URL } from "@/constants";

(async () => {
  try {
    await mongoose.connect(ENV.DB_URI);
    console.log("Database connected successfully");

    const server = createServer(app);

    server.listen(ENV.PORT, () => {
      console.log(`Server listening in '${ENV.NODE_ENV}' mode at: ${SITE_URL}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      server.close(() => {
        console.log("HTTP server closed");
        mongoose.connection.close(false).then(() => {
          console.log("Database connection closed");
          process.exit(0);
        });
      });

      setTimeout(() => {
        console.error("Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.log("Server Initialization Failed", error);
    process.exit(1);
  }
})();
