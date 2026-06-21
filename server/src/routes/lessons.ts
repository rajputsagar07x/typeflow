import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { lessonsTable, lessonContentTable } from "../schema.js";
import { GetLessonsResponse, GetLessonParams, GetLessonResponse } from "../lib/apiSchemas.js";

const router: IRouter = Router();

router.get("/lessons", async (_req, res): Promise<void> => {
  const lessons = await db.select().from(lessonsTable).orderBy(lessonsTable.level);
  res.json(GetLessonsResponse.parse(lessons));
});

router.get("/lessons/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetLessonParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, params.data.id));
  if (!lesson) { res.status(404).json({ error: "Lesson not found" }); return; }
  const contentRows = await db.select().from(lessonContentTable)
    .where(eq(lessonContentTable.lessonId, lesson.id))
    .orderBy(lessonContentTable.position);
  res.json(GetLessonResponse.parse({ ...lesson, content: contentRows.map((r) => r.content) }));
});

export default router;
