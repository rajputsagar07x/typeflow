import { Router, type IRouter } from "express";
import { db } from "../db.js";
import { shortcutsTable } from "../schema.js";
import { GetShortcutsResponse } from "../lib/apiSchemas.js";

const router: IRouter = Router();
router.get("/shortcuts", async (_req, res): Promise<void> => {
  const shortcuts = await db.select().from(shortcutsTable).orderBy(shortcutsTable.id);
  res.json(GetShortcutsResponse.parse(shortcuts));
});
export default router;
