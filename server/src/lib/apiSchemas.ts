import * as zod from "zod";

export const HealthCheckResponse = zod.object({ status: zod.string() });

export const GetLessonsResponseItem = zod.object({
  id: zod.number(), level: zod.number(), title: zod.string(),
  description: zod.string(), category: zod.string(),
  difficulty: zod.enum(["beginner", "intermediate", "advanced", "expert"]),
  estimatedMinutes: zod.number(),
});
export const GetLessonsResponse = zod.array(GetLessonsResponseItem);

export const GetLessonParams = zod.object({ id: zod.coerce.number() });
export const GetLessonResponse = zod.object({
  id: zod.number(), level: zod.number(), title: zod.string(),
  description: zod.string(), category: zod.string(),
  difficulty: zod.enum(["beginner", "intermediate", "advanced", "expert"]),
  estimatedMinutes: zod.number(), content: zod.array(zod.string()), instructions: zod.string(),
});

export const GetPracticeContentQueryParams = zod.object({
  mode: zod.enum(["words", "paragraphs", "quotes", "code"]).default("words"),
  count: zod.coerce.number().default(50),
});
export const GetPracticeContentResponse = zod.object({ mode: zod.string(), text: zod.string() });

export const GetShortcutsResponseItem = zod.object({
  id: zod.number(), keys: zod.array(zod.string()), name: zod.string(),
  purpose: zod.string(), explanation: zod.string(), category: zod.string(),
});
export const GetShortcutsResponse = zod.array(GetShortcutsResponseItem);
