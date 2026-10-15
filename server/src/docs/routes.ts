import { Router } from "express";
import * as controller from "./controller";
import * as middlewares from "@/middlewares";

const router = Router();

router.use(middlewares.addDocsLocals);
router.use(middlewares.htmlMinifierMiddleware);

router.get("/", controller.renderIndex);
router.get("/commands", controller.renderCommands);
router.get("/faq", controller.renderFaq);
router.get("/self-host", controller.renderSelfHost);

router.get("/changelog", controller.renderChangelog);

router.get("/workflow", controller.renderWorkflowIndex);
router.get("/workflow/encryption-flow", controller.renderEncryptionFlow);
router.get(
  "/workflow/authentication-flow",
  controller.renderAuthenticationFlow,
);

export default router;
