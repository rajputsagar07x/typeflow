import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import lessonsRouter from "./lessons.js";
import practiceRouter from "./practice.js";
import shortcutsRouter from "./shortcuts.js";
import adminRouter from "./admin.js";
import trackingRouter from "./tracking.js";

const router: IRouter = Router();
router.use(healthRouter);
router.use(lessonsRouter);
router.use(practiceRouter);
router.use(shortcutsRouter);
router.use(adminRouter);
router.use(trackingRouter);
export default router;
