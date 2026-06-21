import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, ChevronRight, Command } from "lucide-react";
import { useGetShortcuts } from "@/lib/apiClient";

const STORAGE_KEY = "typeflow_shortcuts_progress";

function getShortcutProgress(): Record<number, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveShortcutProgress(progress: Record<number, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function KeyBadge({ k }: { k: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[36px] px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-sm font-mono font-semibold text-foreground shadow-sm">
      {k}
    </kbd>
  );
}

type TabType = "learn" | "practice";

export default function Shortcuts() {
  const [tab, setTab] = useState<TabType>("learn");
  const { data: shortcuts, isLoading } = useGetShortcuts();

  const [practiceIndex, setPracticeIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>(() => getShortcutProgress());
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const practiceShortcuts = shortcuts ?? [];
  const currentShortcut = practiceShortcuts[practiceIndex];

  const totalCompleted = Object.keys(progress).length;

  const normalizeKey = (key: string): string => {
    const map: Record<string, string> = {
      Control: "Ctrl", Meta: "Win", Alt: "Alt", Shift: "Shift",
    };
    return map[key] ?? key.toUpperCase();
  };

  const checkKeys = useCallback(
    (pressed: Set<string>) => {
      if (!currentShortcut) return;
      const expected = currentShortcut.keys.map((k) => k.toUpperCase());
      const actual = Array.from(pressed).map((k) => k.toUpperCase());
      const allMatch = expected.every((k) => actual.includes(k)) && actual.every((k) => expected.includes(k));
      if (allMatch) {
        setFeedback("correct");
        const newProgress = { ...progress, [currentShortcut.id]: (progress[currentShortcut.id] ?? 0) + 1 };
        setProgress(newProgress);
        saveShortcutProgress(newProgress);
        setTimeout(() => {
          setFeedback(null);
          setPracticeIndex((p) => (p + 1) % practiceShortcuts.length);
          setPressedKeys(new Set());
        }, 800);
      }
    },
    [currentShortcut, practiceShortcuts.length, progress]
  );

  useEffect(() => {
    if (tab !== "practice") return;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = normalizeKey(e.key);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = normalizeKey(e.key);
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [tab, normalizeKey]);

  // Check keys whenever pressed set changes
  useEffect(() => {
    if (pressedKeys.size > 0 && feedback === null) {
      const timer = setTimeout(() => checkKeys(pressedKeys), 100);
      return () => clearTimeout(timer);
    }
  }, [pressedKeys, feedback, checkKeys]);

  const handleSkip = () => {
    setFeedback(null);
    setPracticeIndex((p) => (p + 1) % practiceShortcuts.length);
    setPressedKeys(new Set());
  };

  const grouped = shortcuts?.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, typeof shortcuts>
  ) ?? {};

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-card border border-card-border rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" data-testid="shortcuts-heading">Shortcuts</h1>
          <p className="text-muted-foreground text-sm">Learn and practice keyboard shortcuts that save hours.</p>
        </div>
        {tab === "practice" && (
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{totalCompleted}</span> / {practiceShortcuts.length} mastered
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-card border border-card-border rounded-lg p-1 gap-1 w-fit mb-8">
        {(["learn", "practice"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${t}`}
          >
            {t === "learn" ? "Learn Shortcuts" : "Practice Shortcuts"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "learn" ? (
          <motion.div key="learn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Command className="w-3.5 h-3.5" />
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items?.map((s) => (
                    <div
                      key={s.id}
                      className="bg-card border border-card-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                      data-testid={`shortcut-learn-${s.id}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="font-semibold text-sm mb-0.5">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.purpose}</div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {s.keys.map((k, i) => (
                            <span key={k} className="flex items-center gap-1">
                              <KeyBadge k={k} />
                              {i < s.keys.length - 1 && (
                                <span className="text-muted-foreground text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="practice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {currentShortcut ? (
              <div className="max-w-lg mx-auto">
                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${(totalCompleted / practiceShortcuts.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {practiceIndex + 1} / {practiceShortcuts.length}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${practiceIndex}-${feedback}`}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className={`bg-card border rounded-2xl p-8 text-center transition-colors ${
                      feedback === "correct"
                        ? "border-chart-4/50 bg-chart-4/5"
                        : feedback === "incorrect"
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-card-border"
                    }`}
                    data-testid="practice-shortcut-card"
                  >
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {currentShortcut.category}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">Press</div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {currentShortcut.keys.map((k, i) => (
                        <span key={k} className="flex items-center gap-2">
                          <motion.div
                            animate={pressedKeys.has(k.toUpperCase()) ? { scale: 0.95, y: 2 } : { scale: 1, y: 0 }}
                            transition={{ duration: 0.05 }}
                          >
                            <KeyBadge k={k} />
                          </motion.div>
                          {i < currentShortcut.keys.length - 1 && (
                            <span className="text-2xl text-muted-foreground font-light">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="text-xl font-bold mb-2">{currentShortcut.name}</div>
                    <div className="text-sm text-muted-foreground mb-6">{currentShortcut.purpose}</div>

                    <AnimatePresence>
                      {feedback === "correct" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-chart-4 font-semibold mb-4"
                          data-testid="feedback-correct"
                        >
                          <Check className="w-5 h-5" />
                          Correct!
                        </motion.div>
                      )}
                      {feedback === "incorrect" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-destructive font-semibold mb-4"
                          data-testid="feedback-incorrect"
                        >
                          <X className="w-5 h-5" />
                          Try again
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {progress[currentShortcut.id] && (
                      <div className="text-xs text-muted-foreground mb-4">
                        Completed {progress[currentShortcut.id]}x
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleSkip}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                        data-testid="skip-shortcut"
                      >
                        Skip <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setPracticeIndex(0); setProgress({}); saveShortcutProgress({}); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="reset-progress"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  Press the keyboard shortcut shown above
                </p>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="font-bold text-lg mb-2">All shortcuts practiced!</h3>
                <button
                  onClick={() => { setPracticeIndex(0); }}
                  className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Practice Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
