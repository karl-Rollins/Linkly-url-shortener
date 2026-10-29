import { Router } from "express";
import { linkController,redirectController } from "../controllers/linkController.js";

const router = Router();

router.post("/links", linkController)
router.get("/:code", redirectController)

export default router