import { Router } from "express";
import * as controller from "./controller";

const router = Router();

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
