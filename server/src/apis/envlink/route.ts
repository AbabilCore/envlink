import { Router } from "express";
import * as middlewares from "@/middlewares";
import * as controller from "./controller";
import * as validation from "./validation";
import * as el_middleware from "./middleware";

const router = Router();

router.post(
  "/",
  middlewares.createEnvLinkLimiter,
  middlewares.validateBody(validation.CreateEnvLinkSchema),
  controller.create,
);

router.post(
  "/:id/info",
  middlewares.normalOperationsLimiter,
  middlewares.validateParams(validation.EnvLinkParamsSchema),
  middlewares.validateBody(validation.GetInfoEnvLinkSchema),
  el_middleware.verifyEnvLinkPassword,
  controller.getInfo,
);

router.post(
  "/:id/install",
  middlewares.sensitiveOperationsLimiter,
  middlewares.validateParams(validation.EnvLinkParamsSchema),
  middlewares.validateBody(validation.InstallEnvLinkSchema),
  el_middleware.verifyEnvLinkPassword,
  controller.install,
);

router.put(
  "/:id",
  middlewares.sensitiveOperationsLimiter,
  middlewares.validateParams(validation.EnvLinkParamsSchema),
  middlewares.validateBody(validation.UpdateEnvLinkSchema),
  el_middleware.verifyEnvLinkPassword,
  controller.update,
);

router.delete(
  "/:id",
  middlewares.sensitiveOperationsLimiter,
  middlewares.validateParams(validation.EnvLinkParamsSchema),
  middlewares.validateBody(validation.ExpireEnvLinkSchema),
  el_middleware.verifyEnvLinkPassword,
  controller.expire,
);

router.get(
  "/cron/cleanup",
  el_middleware.verifyCronSecret,
  controller.cronCleanup,
);

export default router;
