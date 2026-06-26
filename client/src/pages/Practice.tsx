import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Play, Zap, Target, Trophy } from "lucide-react";
import { useGetPracticeContent, getGetPracticeContentQueryKey } from "@/lib/apiClient";
import { addStat, recordMistake } from "@/lib/stats";

type Mode = "words" | "paragraphs" | "quotes" | "code";
type Duration = 15 | 30 | 60 | 120;

const MODES: { value: Mode; label: string }[] = [
  { value: "words", label: "Words" },
  { value: "paragraphs", label: "Paragraphs" },
  { value: "quotes", label: "Quotes" },
  { value: "code", label: "Code" },
];

const DURATIONS: Duration[] = [15, 30, 60, 120];

interface Result {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  duration: number;
  mode: Mode;
}

export default function Practice() {
  const [mode, setMode] = useState<Mode>("words");
  const [duration, setDuration] = useState<Duration>(60);
  const [sessionKey, setSessionKey] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const params = { mode, count: 100 };
  const { data: content, isLoading, refetch } = useGetPracticeContent(params, {
    query: { queryKey: getGetPracticeContentQueryKey(params) },
  });

  const text = content?.text ?? "";

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, sessionKey]);

  useEffect(() => {
    containerRef.current?.focus();
  }, [sessionKey, finished]);

  const finishSession = useCallback(
    (typedSoFar: string) => {
      fetch("http://localhost:5000/api/tracking/practice", {
  method: "POST",
});
      if (timerRef.current) clearInterval(timerRef.current);
      let correct = 0;
      for (let i = 0; i < typedSoFar.length; i++) {
        if (i < text.length && typedSoFar[i] === text[i]) correct++;
      }
      const elapsed = (Date.now() - (startTimeRef.current ?? Date.now())) / 60000;
      const words = typedSoFar.length / 5;
      const finalWpm = Math.round(words / Math.max(elapsed, 0.001));
      const finalAcc = typedSoFar.length > 0 ? Math.round((correct / typedSoFar.length) * 100) : 100;
      const r: Result = {
        wpm: finalWpm,
        accuracy: finalAcc,
        correctChars: correct,
        totalChars: typedSoFar.length,
        duration,
        mode,
      };
      setResult(r);
      setFinished(true);
      addStat({ date: new Date().toISOString(), wpm: finalWpm, accuracy: finalAcc, duration, mode });
      fetch("http://localhost:5000/api/tracking/practice", {
  method: "POST",
}).catch(() => {});
    },
    [text, duration, mode]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (finished) return;
      if (e.key === "Tab") { e.preventDefault(); return; }
      if (e.key === "Escape") { handleRestart(); return; }

      if (e.key === "Backspace") {
        setTyped((p) => p.slice(0, -1));
        return;
      }
      if (e.key.length !== 1) return;

      const newTyped = typed + e.key;

      if (!started) {
        setStarted(true);
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              finishSession(newTyped);
              setTimeLeft(0 as any);
finishSession(newTyped);
return prev;
            }
            return prev - 1;
          });
        }, 1000);
      }

      // Track mistakes
      const idx = newTyped.length - 1;
      if (idx < text.length && e.key !== text[idx]) {
        recordMistake(text[idx]);
      }

      setTyped(newTyped);

      // Live stats
      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 60000;
        const words = newTyped.length / 5;
        setWpm(Math.round(words / Math.max(elapsed, 0.001)));
        let correct = 0;
        for (let i = 0; i < newTyped.length; i++) {
          if (i < text.length && newTyped[i] === text[i]) correct++;
        }
        setAccuracy(Math.round((correct / newTyped.length) * 100));
      }

      // Finished all text
      if (newTyped.length >= text.length) {
        finishSession(newTyped);
      }
    
    },
    [typed, started, finished, text, finishSession]
  );

  const handleRestart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTyped("");
    setStarted(false);
    setFinished(false);
    setResult(null);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(duration);
    startTimeRef.current = null;
    setSessionKey((k) => k + 1);
    refetch();
  }, [duration, refetch]);

  const progress = text.length > 0 ? (typed.length / text.length) * 100 : 0;
  const timerPct = (timeLeft / duration) * 100;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" data-testid="practice-heading">Practice</h1>
        <p className="text-muted-foreground text-sm">Push your limits. Track every character.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center bg-card border border-card-border rounded-lg p-1 gap-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); handleRestart(); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === m.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`mode-${m.value}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-card border border-card-border rounded-lg p-1 gap-1">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => { setDuration(d); setTimeLeft(d); if (!started) setSessionKey((k) => k + 1); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                duration === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`duration-${d}`}
            >
              {d}s
            </button>
          ))}
        </div>
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          data-testid="restart-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-2xl font-bold tabular-nums text-primary" data-testid="live-wpm">{wpm}</span>
          <span className="text-xs text-muted-foreground">wpm</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-chart-2" />
          <span className="text-2xl font-bold tabular-nums" data-testid="live-accuracy">{accuracy}</span>
          <span className="text-xs text-muted-foreground">%</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div
            className={`text-2xl font-bold tabular-nums font-mono ${timeLeft <= 10 ? "text-destructive" : "text-foreground"}`}
            data-testid="timer"
          >
            {timeLeft}
          </div>
          <span className="text-xs text-muted-foreground">sec</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-muted rounded-full mb-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: timeLeft <= 10 ? "hsl(0 72% 51%)" : "hsl(48 96% 58%)" }}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Progress */}
      <div className="h-0.5 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-chart-2/60 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {finished && result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card border border-primary/30 rounded-2xl p-8 text-center"
            data-testid="result-overlay"
          >
            <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-6">Session Complete</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "WPM", value: result.wpm, color: "text-primary" },
                { label: "Accuracy", value: `${result.accuracy}%`, color: "text-chart-2" },
                { label: "Characters", value: result.correctChars, color: "text-chart-4" },
                { label: "Duration", value: `${result.duration}s`, color: "text-muted-foreground" },
              ].map((s) => (
                <div key={s.label} className="bg-background border border-border rounded-xl p-4">
                  <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleRestart}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
              data-testid="play-again-btn"
            >
              <Play className="w-4 h-4 inline mr-2" />
              Play Again
            </button>
          </motion.div>
        ) : (
          <motion.div key={`practice-${sessionKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {isLoading ? (
              <div className="bg-card border border-card-border rounded-xl p-8 animate-pulse h-48" />
            ) : (
              <div
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="bg-card border border-card-border rounded-xl p-8 font-mono text-lg leading-loose outline-none focus:border-primary/50 transition-colors cursor-text select-none min-h-[200px]"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                data-testid="practice-area"
              >
                {!started && (
                  <div className="text-center text-muted-foreground text-sm mb-4 pb-4 border-b border-border">
                    Click here and start typing to begin
                  </div>
                )}
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "break-word" }}>
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
