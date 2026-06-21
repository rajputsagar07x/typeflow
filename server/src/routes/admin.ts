import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db } from "../db.js";
import {
  lessonsTable, lessonContentTable, practiceTextsTable,
  shortcutsTable, achievementsTable, homepageContentTable,
} from "../schema.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { createToken, verifyCredentials, isAdminConfigured } from "../lib/adminAuth.js";
import { z } from "zod";

const router: IRouter = Router();

router.get("/admin/status", (_req, res): void => {
  res.json({ configured: isAdminConfigured() });
});

const LoginBody = z.object({ email: z.string(), password: z.string() });
router.post("/admin/login", (req, res): void => {
  const body = LoginBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Email and password required" }); return; }
  if (!isAdminConfigured()) { res.status(503).json({ error: "Admin credentials not configured in .env" }); return; }
  if (!verifyCredentials(body.data.email, body.data.password)) { res.status(401).json({ error: "Invalid credentials" }); return; }
  res.json({ token: createToken(body.data.email) });
});

// ── Lessons ──────────────────────────────────────────────────────────────────
router.get("/admin/lessons", adminAuth, async (_req, res): Promise<void> => {
  const lessons = await db.select().from(lessonsTable).orderBy(lessonsTable.level);
  const content = await db.select().from(lessonContentTable).orderBy(lessonContentTable.position);
  res.json(lessons.map((l) => ({
    ...l,
    content: content.filter((c) => c.lessonId === l.id).map((c) => ({ id: c.id, text: c.content, position: c.position })),
  })));
});

const LessonBody = z.object({
  level: z.number().int().positive(), title: z.string().min(1), description: z.string().min(1),
  category: z.string().min(1), difficulty: z.string().min(1),
  estimatedMinutes: z.number().int().positive(), instructions: z.string().min(1),
  content: z.array(z.string()).optional().default([]),
});
router.post("/admin/lessons", adminAuth, async (req, res): Promise<void> => {
  const body = LessonBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const { content, ...meta } = body.data;
  const [lesson] = await db.insert(lessonsTable).values(meta).returning();
  for (let i = 0; i < content.length; i++)
    await db.insert(lessonContentTable).values({ lessonId: lesson.id, content: content[i], position: i });
  res.status(201).json(lesson);
});
router.put("/admin/lessons/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const body = LessonBody.partial().safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const { content, ...meta } = body.data;
  if (Object.keys(meta).length > 0) await db.update(lessonsTable).set(meta).where(eq(lessonsTable.id, id));
  if (content !== undefined) {
    await db.delete(lessonContentTable).where(eq(lessonContentTable.lessonId, id));
    for (let i = 0; i < content.length; i++)
      await db.insert(lessonContentTable).values({ lessonId: id, content: content[i], position: i });
  }
  const [updated] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id));
  res.json(updated);
});
router.delete("/admin/lessons/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  await db.delete(lessonContentTable).where(eq(lessonContentTable.lessonId, id));
  await db.delete(lessonsTable).where(eq(lessonsTable.id, id));
  res.json({ ok: true });
});

// ── Practice Texts ────────────────────────────────────────────────────────────
const PracticeBody = z.object({ mode: z.string().min(1), text: z.string().min(1) });
router.get("/admin/practice", adminAuth, async (_req, res): Promise<void> => {
  res.json(await db.select().from(practiceTextsTable).orderBy(practiceTextsTable.id));
});
router.post("/admin/practice", adminAuth, async (req, res): Promise<void> => {
  const body = PracticeBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.insert(practiceTextsTable).values(body.data).returning();
  res.status(201).json(row);
});
router.put("/admin/practice/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const body = PracticeBody.partial().safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [updated] = await db.update(practiceTextsTable).set(body.data).where(eq(practiceTextsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});
router.delete("/admin/practice/:id", adminAuth, async (req, res): Promise<void> => {
  await db.delete(practiceTextsTable).where(eq(practiceTextsTable.id, parseInt(req.params.id, 10)));
  res.json({ ok: true });
});

// ── Shortcuts ─────────────────────────────────────────────────────────────────
const ShortcutBody = z.object({
  keys: z.array(z.string()).min(1), name: z.string().min(1),
  purpose: z.string().min(1), explanation: z.string().min(1), category: z.string().min(1),
});
router.get("/admin/shortcuts", adminAuth, async (_req, res): Promise<void> => {
  res.json(await db.select().from(shortcutsTable).orderBy(shortcutsTable.id));
});
router.post("/admin/shortcuts", adminAuth, async (req, res): Promise<void> => {
  const body = ShortcutBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.insert(shortcutsTable).values(body.data).returning();
  res.status(201).json(row);
});
router.put("/admin/shortcuts/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const body = ShortcutBody.partial().safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [updated] = await db.update(shortcutsTable).set(body.data).where(eq(shortcutsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});
router.delete("/admin/shortcuts/:id", adminAuth, async (req, res): Promise<void> => {
  await db.delete(shortcutsTable).where(eq(shortcutsTable.id, parseInt(req.params.id, 10)));
  res.json({ ok: true });
});

// ── Achievements ──────────────────────────────────────────────────────────────
const AchievementBody = z.object({
  title: z.string().min(1), description: z.string().min(1),
  xpValue: z.number().int().positive(), requirement: z.string().min(1),
  requirementValue: z.number().int().positive(), icon: z.string().min(1),
});
router.get("/admin/achievements", adminAuth, async (_req, res): Promise<void> => {
  res.json(await db.select().from(achievementsTable).orderBy(achievementsTable.id));
});
router.post("/admin/achievements", adminAuth, async (req, res): Promise<void> => {
  const body = AchievementBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [row] = await db.insert(achievementsTable).values(body.data).returning();
  res.status(201).json(row);
});
router.put("/admin/achievements/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const body = AchievementBody.partial().safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [updated] = await db.update(achievementsTable).set(body.data).where(eq(achievementsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});
router.delete("/admin/achievements/:id", adminAuth, async (req, res): Promise<void> => {
  await db.delete(achievementsTable).where(eq(achievementsTable.id, parseInt(req.params.id, 10)));
  res.json({ ok: true });
});

// ── Homepage Content ──────────────────────────────────────────────────────────
const HOMEPAGE_DEFAULTS: Record<string, string> = {
  hero_title: "Learn. Practice.\nMaster Typing.",
  hero_subtitle: "Master typing and keyboard productivity skills through structured learning. Track your progress, analyze your weak spots, and reach typing mastery.",
  features_title: "Everything you need to reach typing mastery",
  features_subtitle: "A complete toolkit for serious typists. No bloat, no distractions.",
  faq_title: "Frequently Asked Questions",
  footer_text: "All progress stored locally in your browser.",
  cta_title: "Ready to become a faster typist?",
  cta_subtitle: "Start with the home row. Everything else follows.",
};

async function ensureHomepageDefaults(): Promise<void> {
  const existing = await db.select({ key: homepageContentTable.key }).from(homepageContentTable);
  const existingKeys = new Set(existing.map((r) => r.key));
  for (const [key, value] of Object.entries(HOMEPAGE_DEFAULTS)) {
    if (!existingKeys.has(key))
      await db.insert(homepageContentTable).values({ key, value });
  }
}

router.get("/homepage", async (_req, res): Promise<void> => {
  await ensureHomepageDefaults();
  const rows = await db.select().from(homepageContentTable).orderBy(homepageContentTable.id);
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

router.get("/admin/homepage", adminAuth, async (_req, res): Promise<void> => {
  await ensureHomepageDefaults();
  const rows = await db.select().from(homepageContentTable).orderBy(homepageContentTable.id);
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

router.put("/admin/homepage", adminAuth, async (req, res): Promise<void> => {
  const body = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    const existing = await db.select().from(homepageContentTable).where(eq(homepageContentTable.key, key));
    if (existing.length > 0)
      await db.update(homepageContentTable).set({ value }).where(eq(homepageContentTable.key, key));
    else
      await db.insert(homepageContentTable).values({ key, value });
  }
  const rows = await db.select().from(homepageContentTable);
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
});

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get("/admin/analytics", adminAuth, async (_req, res): Promise<void> => {
  const [lessonStats] = await db.select({ total: count() }).from(lessonsTable);
  const [practiceStats] = await db.select({ total: count() }).from(practiceTextsTable);
  const [shortcutStats] = await db.select({ total: count() }).from(shortcutsTable);
  const [achievementStats] = await db.select({ total: count() }).from(achievementsTable);
  const lessonsByDifficulty = await db.select({ difficulty: lessonsTable.difficulty, total: count() }).from(lessonsTable).groupBy(lessonsTable.difficulty);
  const practiceByMode = await db.select({ mode: practiceTextsTable.mode, total: count() }).from(practiceTextsTable).groupBy(practiceTextsTable.mode);
  const shortcutsByCategory = await db.select({ category: shortcutsTable.category, total: count() }).from(shortcutsTable).groupBy(shortcutsTable.category);
  res.json({
    totals: { lessons: lessonStats.total, practiceTexts: practiceStats.total, shortcuts: shortcutStats.total, achievements: achievementStats.total },
    lessonsByDifficulty, practiceByMode, shortcutsByCategory,
  });
});

export default router;
