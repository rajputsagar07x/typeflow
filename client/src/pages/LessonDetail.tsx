import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, RotateCcw, ChevronRight } from "lucide-react";
import { useGetLesson, getGetLessonQueryKey } from "@/lib/apiClient";
import { addStat, markLessonComplete, recordMistake } from "@/lib/stats";

function TypingArea({
  text,
  onComplete,
}: {
  text: string;
  onComplete: (wpm: number, accuracy: number) => void;
}) {
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    setTyped("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setDone(false);
  }, [text]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (done) return;
      if (e.key === "Backspace") {
        if (typed.length > 0) {
          setTyped((p) => p.slice(0, -1));
        }
        return;
      }
      if (e.key.length !== 1) return;

      const newTyped = typed + e.key;
      if (!startTime) setStartTime(Date.now());

      // Record mistake
      const idx = newTyped.length - 1;
      if (idx < text.length && e.key !== text[idx]) {
        recordMistake(text[idx]);
      }

      setTyped(newTyped);

      // Calc WPM
      if (startTime) {
        const elapsed = (Date.now() - startTime) / 60000;
        const wordsTyped = newTyped.length / 5;
        setWpm(Math.round(wordsTyped / Math.max(elapsed, 0.001)));
      }

      // Calc accuracy
      let correct = 0;
      for (let i = 0; i < newTyped.length; i++) {
        if (i < text.length && newTyped[i] === text[i]) correct++;
      }
      setAccuracy(Math.round((correct / newTyped.length) * 100));

      // Done?
      if (newTyped.length >= text.length) {
        const elapsed = (Date.now() - (startTime || Date.now())) / 60000;
        const wordsTyped = text.length / 5;
        const finalWpm = Math.round(wordsTyped / Math.max(elapsed, 0.001));
        const finalAcc = Math.round((correct / newTyped.length) * 100);
        setDone(true);
        onComplete(finalWpm, finalAcc);
      }
    },
    [typed, startTime, text, done, onComplete]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-primary font-bold text-xl tabular-nums">{wpm}</div>
          <div className="text-muted-foreground text-xs">WPM</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-xl tabular-nums">{accuracy}%</div>
          <div className="text-muted-foreground text-xs">Accuracy</div>
        </div>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${(typed.length / text.length) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {typed.length} / {text.length}
        </div>
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="bg-background border border-border rounded-xl p-6 font-mono text-lg leading-relaxed outline-none focus:border-primary/50 transition-colors cursor-text select-none"
        style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        data-testid="typing-area"
      >
        <div style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
          {text.split("").map((char, i) => {
            let cls = "typing-pending";
            if (i < typed.length) {
              cls = typed[i] === char ? "typing-correct" : "typing-incorrect";
            } else if (i === typed.length) {
              cls = "typing-cursor";
            }
            return (
              <span key={i} className={cls}>
                {char}
              </span>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">Click above and start typing</p>
    </div>
  );
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id ?? "0", 10);
  const [, setLocation] = useLocation();

  const { data: lesson, isLoading } = useGetLesson(lessonId, {
    query: { enabled: !!lessonId, queryKey: getGetLessonQueryKey(lessonId) },
  });

  const [contentIndex, setContentIndex] = useState(0);
  const [completed, setCompleted] = useState<{ wpm: number; accuracy: number }[]>([]);
  const [lessonDone, setLessonDone] = useState(false);

  const currentText = lesson?.content?.[contentIndex] ?? "";

  const handleComplete = useCallback(
    (wpm: number, accuracy: number) => {
      const newCompleted = [...completed, { wpm, accuracy }];
      setCompleted(newCompleted);

      const isLastContent = contentIndex >= (lesson?.content?.length ?? 1) - 1;
      if (isLastContent) {
        const avgWpm = Math.round(newCompleted.reduce((a, b) => a + b.wpm, 0) / newCompleted.length);
        const avgAcc = Math.round(newCompleted.reduce((a, b) => a + b.accuracy, 0) / newCompleted.length);
        addStat({
          date: new Date().toISOString(),
          wpm: avgWpm,
          accuracy: avgAcc,
          duration: (lesson?.estimatedMinutes ?? 10) * 60,
          mode: "lesson",
        });
        markLessonComplete(lessonId);
        setLessonDone(true);
      }
    },
    [completed, contentIndex, lesson, lessonId]
  );

  const handleNext = useCallback(() => {
    if (contentIndex < (lesson?.content?.length ?? 1) - 1) {
      setContentIndex((p) => p + 1);
    }
  }, [contentIndex, lesson]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 text-center">
        <p className="text-muted-foreground">Lesson not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button
        onClick={() => setLocation("/lessons")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        data-testid="back-to-lessons"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lessons
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Level {lesson.level}</span>
            <span className="text-xs text-muted-foreground capitalize">{lesson.difficulty}</span>
          </div>
          <h1 className="text-2xl font-bold" data-testid="lesson-title">{lesson.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{lesson.description}</p>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-4 mb-6">
        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.instructions}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {lesson.content.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < completed.length
                ? "bg-primary w-6"
                : i === contentIndex
                ? "bg-primary/60 w-4"
                : "bg-muted w-4"
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {contentIndex + 1} / {lesson.content.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {lessonDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-primary/30 rounded-xl p-8 text-center"
            data-testid="lesson-complete"
          >
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Lesson Complete!</h2>
            <p className="text-muted-foreground mb-6 text-sm">{lesson.title} finished successfully.</p>
            <div className="flex items-center justify-center gap-8 mb-8">
              {completed.length > 0 && (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round(completed.reduce((a, b) => a + b.wpm, 0) / completed.length)}
                    </div>
                    <div className="text-xs text-muted-foreground">avg WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {Math.round(completed.reduce((a, b) => a + b.accuracy, 0) / completed.length)}%
                    </div>
                    <div className="text-xs text-muted-foreground">accuracy</div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setLocation("/lessons")}
                className="px-6 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-accent transition-colors"
                data-testid="back-to-lessons-btn"
              >
                All Lessons
              </button>
              <button
                onClick={() => setLocation("/practice")}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                data-testid="go-to-practice"
              >
                Practice Mode
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={`content-${contentIndex}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <TypingArea
              key={`${contentIndex}-${currentText}`}
              text={currentText}
              onComplete={handleComplete}
            />
            {completed.length > contentIndex && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="next-content-btn"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!lessonDone && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              setCompleted([]);
              setContentIndex(0);
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="restart-lesson"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart lesson
          </button>
        </div>
      )}
    </div>
  );
}
