import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { CheckCircle2, Clock, ChevronRight, BookOpen } from "lucide-react";
import { useGetLessons } from "@/lib/apiClient";
import { getCompletedLessons } from "@/lib/stats";

const difficultyColors: Record<string, string> = {
  beginner: "text-chart-4 bg-chart-4/10 border-chart-4/20",
  intermediate: "text-chart-2 bg-chart-2/10 border-chart-2/20",
  advanced: "text-chart-3 bg-chart-3/10 border-chart-3/20",
  expert: "text-destructive bg-destructive/10 border-destructive/20",
};

export default function Lessons() {
  const { data: lessons, isLoading } = useGetLessons();
  const completedIds = useMemo(() => getCompletedLessons(), []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-8 w-32 bg-muted rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl p-6 h-44 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const grouped = [
    { label: "Foundation", levels: lessons?.filter((l) => l.difficulty === "beginner") ?? [] },
    { label: "Intermediate", levels: lessons?.filter((l) => l.difficulty === "intermediate") ?? [] },
    { label: "Advanced", levels: lessons?.filter((l) => l.difficulty === "advanced") ?? [] },
    { label: "Expert", levels: lessons?.filter((l) => l.difficulty === "expert") ?? [] },
  ].filter((g) => g.levels.length > 0);

  const total = lessons?.length ?? 0;
  const completed = completedIds.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" data-testid="lessons-heading">Lessons</h1>
          <p className="text-muted-foreground text-sm">
            8 levels from home row basics to expert mastery. Complete in order.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">{completed} / {total} completed</div>
          <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {grouped.map((group) => (
          <div key={group.label}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{group.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.levels.map((lesson, i) => {
                const isCompleted = completedIds.includes(lesson.id);
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/lessons/${lesson.id}`}>
                      <div
                        className={`bg-card border rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01] group ${
                          isCompleted
                            ? "border-primary/30 bg-primary/5"
                            : "border-card-border hover:border-primary/30"
                        }`}
                        data-testid={`lesson-card-${lesson.id}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                              Level {lesson.level}
                            </span>
                            {isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${difficultyColors[lesson.difficulty] ?? ""}`}>
                            {lesson.difficulty}
                          </span>
                        </div>

                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {lesson.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{lesson.estimatedMinutes} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>{isCompleted ? "Review" : "Start"}</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {(!lessons || lessons.length === 0) && !isLoading && (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No lessons available.</p>
        </div>
      )}
    </div>
  );
}
