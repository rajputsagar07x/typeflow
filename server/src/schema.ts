import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  instructions: text("instructions").notNull(),
});

export const lessonContentTable = pgTable("lesson_content", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  content: text("content").notNull(),
  position: integer("position").notNull(),
});

export const shortcutsTable = pgTable("shortcuts", {
  id: serial("id").primaryKey(),
  keys: text("keys").array().notNull(),
  name: text("name").notNull(),
  purpose: text("purpose").notNull(),
  explanation: text("explanation").notNull(),
  category: text("category").notNull(),
});

export const practiceTextsTable = pgTable("practice_texts", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull(),
  text: text("text").notNull(),
});

export const achievementsTable = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xpValue: integer("xp_value").notNull().default(10),
  requirement: text("requirement").notNull(),
  requirementValue: integer("requirement_value").notNull(),
  icon: text("icon").notNull().default("trophy"),
});

export const homepageContentTable = pgTable("homepage_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  picture: text("picture"),
  provider: text("provider").notNull().default("google"),
});