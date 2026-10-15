import path from "path";
import express from "express";
import docsRouter from "@/docs/routes";
import * as middlewares from "@/middlewares";
import { catchAsync, sendResponse } from "@/helpers";
import { HTTP_CODE } from "@/constants";
import ENV from "@/config";
import apis from "@/apis";

const app = express();

app.set("trust proxy", 1);
app.set("json spaces", 2);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "docs/views"));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static(path.join(process.cwd(), "public")));

if (ENV.NODE_ENV == "development") {
  app.use((req, res, next) => {
    console.log("..................................................");
    console.log(req.method, req.url, "\n", Object.keys(req.body || {}));
    console.log("..................................................");
    next();
  });
}

app.use("/", docsRouter);

app.get(
  "/api/health",
  catchAsync(async (_, res) => {
    sendResponse(res, {
      success: true,
      status: HTTP_CODE.OK,
      message: "Server is running",
      data: {
        status: "healthy",
        uptime: Math.floor(process.uptime()) + "s",
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

app.use("/api", apis);
app.use((req, res) => res.redirect("/"));
app.use(middlewares.globalErrorHandler);

export default app;
