/**
 * Standalone API client — replaces @workspace/api-client-react.
 * Provides React Query hooks for all TypeFlow API endpoints.
 */
import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult, QueryKey } from "@tanstack/react-query";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HealthStatus { status: string; }

export interface Lesson {
  id: number; level: number; title: string; description: string;
  category: string; difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedMinutes: number;
}

export interface LessonDetail extends Lesson {
  content: string[]; instructions: string;
}

export interface PracticeContent { mode: string; text: string; }

export interface Shortcut {
  id: number; keys: string[]; name: string; purpose: string;
  explanation: string; category: string;
}

export type GetPracticeContentParams = {
  mode?: "words" | "paragraphs" | "quotes" | "code"; count?: number;
};

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json() as { error?: string }; if (d?.error) msg += `: ${d.error}`; } catch { /* noop */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const getGetLessonsQueryKey = () => ["/api/lessons"] as const;

export function useGetLessons<TData = Lesson[]>(
  options?: { query?: UseQueryOptions<Lesson[], Error, TData> }
): UseQueryResult<TData, Error> & { queryKey: QueryKey } {
  const queryKey = getGetLessonsQueryKey();
  const q = useQuery({
    queryKey, queryFn: ({ signal }) => apiFetch<Lesson[]>("/api/lessons", { signal }),
    ...options?.query,
  }) as UseQueryResult<TData, Error> & { queryKey: QueryKey };
  q.queryKey = queryKey; return q;
}

export const getGetLessonQueryKey = (id: number) => [`/api/lessons/${id}`] as const;

export function useGetLesson<TData = LessonDetail>(
  id: number, options?: { query?: UseQueryOptions<LessonDetail, Error, TData> }
): UseQueryResult<TData, Error> & { queryKey: QueryKey } {
  const queryKey = getGetLessonQueryKey(id);
  const q = useQuery({
    queryKey, enabled: !!id,
    queryFn: ({ signal }) => apiFetch<LessonDetail>(`/api/lessons/${id}`, { signal }),
    ...options?.query,
  }) as UseQueryResult<TData, Error> & { queryKey: QueryKey };
  q.queryKey = queryKey; return q;
}

// ─── Practice ────────────────────────────────────────────────────────────────

export const getGetPracticeContentQueryKey = (params?: GetPracticeContentParams) =>
  ["/api/practice/content", params] as const;

export function useGetPracticeContent<TData = PracticeContent>(
  params?: GetPracticeContentParams,
  options?: { query?: UseQueryOptions<PracticeContent, Error, TData> }
): UseQueryResult<TData, Error> & { queryKey: QueryKey } {
  const queryKey = getGetPracticeContentQueryKey(params);
  const q = useQuery({
    queryKey,
    queryFn: ({ signal }) => {
      const qs = new URLSearchParams();
      if (params?.mode) qs.set("mode", params.mode);
      if (params?.count != null) qs.set("count", String(params.count));
      return apiFetch<PracticeContent>(`/api/practice/content${qs.toString() ? `?${qs}` : ""}`, { signal });
    },
    ...options?.query,
  }) as UseQueryResult<TData, Error> & { queryKey: QueryKey };
  q.queryKey = queryKey; return q;
}

// ─── Shortcuts ───────────────────────────────────────────────────────────────

export const getGetShortcutsQueryKey = () => ["/api/shortcuts"] as const;

export function useGetShortcuts<TData = Shortcut[]>(
  options?: { query?: UseQueryOptions<Shortcut[], Error, TData> }
): UseQueryResult<TData, Error> & { queryKey: QueryKey } {
  const queryKey = getGetShortcutsQueryKey();
  const q = useQuery({
    queryKey, queryFn: ({ signal }) => apiFetch<Shortcut[]>("/api/shortcuts", { signal }),
    ...options?.query,
  }) as UseQueryResult<TData, Error> & { queryKey: QueryKey };
  q.queryKey = queryKey; return q;
}
