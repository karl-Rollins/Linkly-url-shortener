import { Router } from "express";
import { linkController,redirectController, getLinkController, getClicksController } from "../controllers/linkController.js";

const router = Router();

router.post("/links", linkController)
router.get("/links/:code/clicks", getClicksController)
router.get("/links/:code", getLinkController)
router.get("/:code", redirectController)

export default router