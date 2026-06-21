const BASE = "/api/admin";
const TOKEN_KEY = "typeflow_admin_token";

// sessionStorage is used intentionally: it is scoped to the browser tab and
// is wiped automatically when the tab or window is closed, so every new
// browser session requires a fresh login.
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

function headers(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    clearToken();
    window.location.href = "/owner-admin";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// Auth
export async function checkAdminStatus(): Promise<{ configured: boolean }> {
  const res = await fetch("/api/admin/status");
  return res.json();
}

export async function login(email: string, password: string): Promise<void> {
  const data = await request<{ token: string }>("POST", "/login", { email, password });
  setToken(data.token);
}

export function logout(): void {
  clearToken();
}

// Types
export interface AdminLesson {
  id: number;
  level: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  instructions: string;
  content: { id: number; text: string; position: number }[];
}

export interface AdminPracticeText {
  id: number;
  mode: string;
  text: string;
}

export interface AdminShortcut {
  id: number;
  keys: string[];
  name: string;
  purpose: string;
  explanation: string;
  category: string;
}

export interface AdminAchievement {
  id: number;
  title: string;
  description: string;
  xpValue: number;
  requirement: string;
  requirementValue: number;
  icon: string;
}

export interface AdminAnalytics {
  totals: { lessons: number; practiceTexts: number; shortcuts: number; achievements: number };
  lessonsByDifficulty: { difficulty: string; total: number }[];
  practiceByMode: { mode: string; total: number }[];
  shortcutsByCategory: { category: string; total: number }[];
}

// Lessons
export const adminLessons = {
  list: () => request<AdminLesson[]>("GET", "/lessons"),
  create: (data: Omit<AdminLesson, "id">) => request<AdminLesson>("POST", "/lessons", data),
  update: (id: number, data: Partial<Omit<AdminLesson, "id">>) => request<AdminLesson>("PUT", `/lessons/${id}`, data),
  delete: (id: number) => request<{ ok: boolean }>("DELETE", `/lessons/${id}`),
};

// Practice
export const adminPractice = {
  list: () => request<AdminPracticeText[]>("GET", "/practice"),
  create: (data: Omit<AdminPracticeText, "id">) => request<AdminPracticeText>("POST", "/practice", data),
  update: (id: number, data: Partial<Omit<AdminPracticeText, "id">>) => request<AdminPracticeText>("PUT", `/practice/${id}`, data),
  delete: (id: number) => request<{ ok: boolean }>("DELETE", `/practice/${id}`),
};

// Shortcuts
export const adminShortcuts = {
  list: () => request<AdminShortcut[]>("GET", "/shortcuts"),
  create: (data: Omit<AdminShortcut, "id">) => request<AdminShortcut>("POST", "/shortcuts", data),
  update: (id: number, data: Partial<Omit<AdminShortcut, "id">>) => request<AdminShortcut>("PUT", `/shortcuts/${id}`, data),
  delete: (id: number) => request<{ ok: boolean }>("DELETE", `/shortcuts/${id}`),
};

// Achievements
export const adminAchievements = {
  list: () => request<AdminAchievement[]>("GET", "/achievements"),
  create: (data: Omit<AdminAchievement, "id">) => request<AdminAchievement>("POST", "/achievements", data),
  update: (id: number, data: Partial<Omit<AdminAchievement, "id">>) => request<AdminAchievement>("PUT", `/achievements/${id}`, data),
  delete: (id: number) => request<{ ok: boolean }>("DELETE", `/achievements/${id}`),
};

// Homepage
export const adminHomepage = {
  get: () => request<Record<string, string>>("GET", "/homepage"),
  update: (data: Record<string, string>) => request<Record<string, string>>("PUT", "/homepage", data),
};

// Analytics
export const adminAnalyticsApi = {
  get: () => request<AdminAnalytics>("GET", "/analytics"),
};
