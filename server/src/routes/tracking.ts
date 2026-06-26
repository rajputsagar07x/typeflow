import { Router } from "express";
import { db } from "../db.js";
import {
  trackingTable,
  lessonViewsTable,
  shortcutViewsTable
} from "../schema.js";
import { eq } from "drizzle-orm";



const router = Router();

router.get("/tracking", async (_, res) => {
  let data = await db.select().from(trackingTable);

  if (data.length === 0) {
    await db.insert(trackingTable).values({
      totalVisitors: 0,
      uniqueVisitors: 0,
      visitorsToday: 0,
      visitorsThisWeek: 0,
      totalPracticeSessions: 0,
    });

    data = await db.select().from(trackingTable);
  }

  res.json(data[0]);
});

router.post("/tracking/visit", async (_, res) => {
  let data = await db.select().from(trackingTable);

  if (data.length === 0) {
    await db.insert(trackingTable).values({});
    data = await db.select().from(trackingTable);
  }

  const row = data[0];

  await db
    .update(trackingTable)
    .set({
      totalVisitors: row.totalVisitors + 1,
      uniqueVisitors: row.uniqueVisitors + 1,
      visitorsToday: row.visitorsToday + 1,
      visitorsThisWeek: row.visitorsThisWeek + 1,
    })
    .where(eq(trackingTable.id, row.id));

  res.json({ success: true });
});

router.post("/tracking/practice", async (_, res) => {
  const data = await db.select().from(trackingTable);

  if (data.length === 0) {
    return res.json({ success: false });
  }

  const row = data[0];

  await db
    .update(trackingTable)
    .set({
      totalPracticeSessions: row.totalPracticeSessions + 1,
    })
    .where(eq(trackingTable.id, row.id));

  res.json({ success: true });
});

router.post("/tracking/lesson/:id", async (req, res) => {
  const lessonId = Number(req.params.id);

  const existing = await db
    .select()
    .from(lessonViewsTable)
    .where(eq(lessonViewsTable.lessonId, lessonId));

  if (existing.length > 0) {
    await db
      .update(lessonViewsTable)
      .set({
        views: existing[0].views + 1,
      })
      .where(eq(lessonViewsTable.lessonId, lessonId));
  } else {
    await db.insert(lessonViewsTable).values({
      lessonId,
      views: 1,
    });
  }

  console.log("Lesson Viewed:", lessonId);

  res.json({ success: true });
});
router.post("/tracking/shortcut/:id", async (req, res) => {
  const shortcutId = Number(req.params.id);

  let data = await db
    .select()
    .from(shortcutViewsTable)
    .where(eq(shortcutViewsTable.shortcutId, shortcutId));

  if (data.length === 0) {
    await db.insert(shortcutViewsTable).values({
      shortcutId,
      views: 1,
    });
  } else {
    await db
      .update(shortcutViewsTable)
      .set({
        views: data[0].views + 1,
      })
      .where(eq(shortcutViewsTable.id, data[0].id));
  }

  console.log("Shortcut Used:", shortcutId);

  res.json({ success: true });
});
router.get("/lesson-stats", async (_, res) => {
  const data = await db.select().from(lessonViewsTable);
  res.json(data);
});
export default router;