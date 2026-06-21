import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Zap, Target, TrendingUp, Clock, BookOpen, ChevronRight, Activity } from "lucide-react";
import { getStats, getCompletedLessons, getSummary } from "@/lib/stats";
import { useGetLessons } from "@/lib/apiClient";

function StatCard({ label, value, unit, icon: Icon, color = "text-primary" }: {
  label: string; value: number | string; unit?: string; icon: React.ElementType; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-popover-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold text-foreground">
          {p.name}: <span className="text-primary">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const stats = useMemo(() => getStats(), []);
  const summary = useMemo(() => getSummary(), []);
  const completedIds = useMemo(() => getCompletedLessons(), []);
  const { data: lessons } = useGetLessons();

  const wpmHistory = stats.slice(-20).map((s, i) => ({
    session: `#${i + 1}`,
    WPM: s.wpm,
    Accuracy: s.accuracy,
    date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  const recent = stats.slice(-5).reverse();

  const completedLessons = lessons?.filter((l) => completedIds.includes(l.id)) ?? [];
  const nextLesson = lessons?.find((l) => !completedIds.includes(l.id));

  const hasStats = stats.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" data-testid="dashboard-heading">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your typing performance at a glance.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Current WPM" value={summary.currentWpm} unit="wpm" icon={Zap} />
        <StatCard label="Best WPM" value={summary.bestWpm} unit="wpm" icon={TrendingUp} />
        <StatCard label="Average WPM" value={summary.avgWpm} unit="wpm" icon={Activity} />
        <StatCard label="Accuracy" value={summary.accuracy} unit="%" icon={Target} />
        <StatCard label="Practice Time" value={summary.totalMinutes} unit="min" icon={Clock} />
      </div>

      {!hasStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-card-border rounded-xl p-8 text-center mb-8"
        >
          <Zap className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold mb-2">No sessions yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Complete a practice session to see your stats here.</p>
          <Link href="/practice">
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors" data-testid="dashboard-start-practice">
              Start Practicing
            </button>
          </Link>
        </motion.div>
      )}

      {hasStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* WPM Trend */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground" data-testid="wpm-chart-heading">WPM Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wpmHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 15% 16%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="WPM" stroke="hsl(48 96% 58%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Accuracy Trend */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground" data-testid="accuracy-chart-heading">Accuracy Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wpmHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 15% 16%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Accuracy" stroke="hsl(195 90% 55%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No activity yet. Start a practice session!</p>
          ) : (
            <div className="space-y-2">
              {recent.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-background border border-border" data-testid={`recent-session-${i}`}>
                  <div>
                    <div className="text-sm font-medium capitalize">{s.mode} mode</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()} — {s.duration}s</div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary font-bold text-sm">{s.wpm} wpm</div>
                    <div className="text-xs text-muted-foreground">{s.accuracy}% acc</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Lesson Progress</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-semibold">{completedIds.length} / {lessons?.length ?? 8}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedIds.length / (lessons?.length ?? 8)) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>

          {completedLessons.length > 0 && (
            <div className="space-y-1 mb-4">
              {completedLessons.slice(-3).map((l) => (
                <div key={l.id} className="flex items-center gap-2 text-sm py-1">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-muted-foreground">{l.title}</span>
                </div>
              ))}
            </div>
          )}

          {nextLesson && (
            <Link href={`/lessons/${nextLesson.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors" data-testid="next-lesson-card">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-xs text-primary font-medium">Next Up</div>
                    <div className="text-sm font-semibold">{nextLesson.title}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </Link>
          )}

          {!nextLesson && completedIds.length > 0 && (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🎓</div>
              <p className="text-sm font-semibold">All lessons complete!</p>
              <p className="text-xs text-muted-foreground mt-1">Keep practicing to push your WPM higher.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
