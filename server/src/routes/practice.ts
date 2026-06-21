import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../db.js";
import { practiceTextsTable } from "../schema.js";
import { GetPracticeContentQueryParams, GetPracticeContentResponse } from "../lib/apiSchemas.js";

const router: IRouter = Router();
router.get("/practice/content", async (req, res): Promise<void> => {
  const queryParams = GetPracticeContentQueryParams.safeParse(req.query);
  if (!queryParams.success) { res.status(400).json({ error: queryParams.error.message }); return; }
  const mode = queryParams.data.mode ?? "words";
  const rows = await db.select().from(practiceTextsTable)
    .where(eq(practiceTextsTable.mode, mode))
    .orderBy(sql`RANDOM()`).limit(1);
  const text = rows.length > 0 ? rows[0].text
    : "the quick brown fox jumps over the lazy dog practice typing every day to build speed and accuracy";
  res.json(GetPracticeContentResponse.parse({ mode, text }));
});
export default router;
