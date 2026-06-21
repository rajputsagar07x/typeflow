import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import { TrendingUp, Target, Clock, Zap, Activity, AlertTriangle } from "lucide-react";
import { getStats, getWeakKeys, getSummary } from "@/lib/stats";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-popover-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const WEAK_KEY_RECOMMENDATIONS: Record<string, string> = {
  q: "Practice Top Row Left", w: "Practice Top Row Left", e: "Practice Top Row Left",
  r: "Practice Top Row Left", t: "Practice Top Row Left",
  y: "Practice Top Row Right", u: "Practice Top Row Right", i: "Practice Top Row Right",
  o: "Practice Top Row Right", p: "Practice Top Row Right",
  a: "Practice Home Row Left", s: "Practice Home Row Left", d: "Practice Home Row Left", f: "Practice Home Row Left",
  g: "Practice Home Row Left",
  h: "Practice Home Row Right", j: "Practice Home Row Right", k: "Practice Home Row Right",
  l: "Practice Home Row Right",
  z: "Practice Bottom Row Left", x: "Practice Bottom Row Left", c: "Practice Bottom Row Left",
  v: "Practice Bottom Row Left", b: "Practice Bottom Row Left",
  n: "Practice Bottom Row Right", m: "Practice Bottom Row Right",
};

function getRecommendation(key: string): string {
  const lower = key.toLowerCase();
  return WEAK_KEY_RECOMMENDATIONS[lower] ?? "Focus on accuracy for this key";
}

function StatCard({ label, value, unit, icon: Icon }: { label: string; value: number | string; unit?: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-card-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const stats = useMemo(() => getStats(), []);
  const summary = useMemo(() => getSummary(), []);
  const weakKeys = useMemo(() => getWeakKeys(), []);

  const wpmHistory = stats.map((s, i) => ({
    session: `#${i + 1}`,
    WPM: s.wpm,
    date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  const accHistory = stats.map((s, i) => ({
    session: `#${i + 1}`,
    Accuracy: s.accuracy,
    date: new Date(s.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  const sortedWeakKeys = Object.entries(weakKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const uniqueRecommendations = Array.from(
    new Set(sortedWeakKeys.map(([key]) => getRecommendation(key)))
  ).slice(0, 3);

  const hasData = stats.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" data-testid="analytics-heading">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your improvement over time.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Current WPM" value={summary.currentWpm} unit="wpm" icon={Zap} />
        <StatCard label="Best WPM" value={summary.bestWpm} unit="wpm" icon={TrendingUp} />
        <StatCard label="Average WPM" value={summary.avgWpm} unit="wpm" icon={Activity} />
        <StatCard label="Accuracy" value={`${summary.accuracy}%`} icon={Target} />
        <StatCard label="Practice Time" value={summary.totalMinutes} unit="min" icon={Clock} />
      </div>

      {!hasData ? (
        <div className="bg-card border border-card-border rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="font-semibold mb-2">No data yet</h3>
          <p className="text-sm text-muted-foreground">Complete practice sessions to see your analytics here.</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-card-border rounded-xl p-6"
            >
              <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground" data-testid="wpm-history-heading">
                WPM History
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={wpmHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 15% 16%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="WPM" stroke="hsl(48 96% 58%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(48 96% 58%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-card-border rounded-xl p-6"
            >
              <h2 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground" data-testid="accuracy-history-heading">
                Accuracy History
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={accHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 15% 16%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Accuracy" stroke="hsl(195 90% 55%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(195 90% 55%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Weak Keys */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-card-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground" data-testid="weak-keys-heading">
                Weak Key Analysis
              </h2>
            </div>

            {sortedWeakKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No mistakes recorded yet. Keep practicing!</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs text-muted-foreground mb-4 font-medium">Most Frequent Mistakes</h3>
                  <div className="space-y-2">
                    {sortedWeakKeys.map(([key, count], i) => (
                      <div key={key} className="flex items-center gap-3" data-testid={`weak-key-${key}`}>
                        <span className="w-5 text-center text-sm font-mono font-bold text-foreground">
                          {key === " " ? "SP" : key.toUpperCase()}
                        </span>
                        <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                          <motion.div
                            className="h-full rounded"
                            style={{
                              background: i < 3 ? "hsl(0 72% 51%)" : i < 6 ? "hsl(48 96% 58%)" : "hsl(195 90% 55%)",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / sortedWeakKeys[0][1]) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                          />
                        </div>
                        <span className="text-sm font-semibold tabular-nums w-8 text-right text-muted-foreground">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-muted-foreground mb-4 font-medium">Recommendations</h3>
                  {uniqueRecommendations.length > 0 ? (
                    <div className="space-y-3">
                      {uniqueRecommendations.map((rec, i) => (
                        <div key={rec} className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{i + 1}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold mb-0.5">{rec}</div>
                            <div className="text-xs text-muted-foreground">
                              Focus on this row in the Lessons section for targeted improvement.
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recommendations yet.</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
