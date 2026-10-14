import { Router } from "express";
import * as controller from "./controller";
import * as middlewares from "@/middlewares";

const router = Router();

router.get(
  "/",
  middlewares.normalOperationsLimiter,
  controller.getStats,
);

export default router;