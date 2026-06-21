import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BookOpen, Type, Command, Trophy, TrendingUp, Database } from "lucide-react";
import { adminAnalyticsApi, type AdminAnalytics } from "@/lib/adminApi";

const COLORS = [
  "hsl(48 96% 58%)",
  "hsl(195 90% 55%)",
  "hsl(280 70% 65%)",
  "hsl(160 70% 50%)",
  "hsl(0 72% 60%)",
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-popover-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-primary">{payload[0].value}</p>
    </div>
  );
};

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminAnalyticsApi.get()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card border border-card-border rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-1" data-testid="admin-dashboard-heading">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Content overview and statistics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lessons" value={data?.totals.lessons ?? 0} icon={BookOpen} color="hsl(48 96% 58%)" />
        <StatCard label="Practice Texts" value={data?.totals.practiceTexts ?? 0} icon={Type} color="hsl(195 90% 55%)" />
        <StatCard label="Shortcuts" value={data?.totals.shortcuts ?? 0} icon={Command} color="hsl(280 70% 65%)" />
        <StatCard label="Achievements" value={data?.totals.achievements ?? 0} icon={Trophy} color="hsl(160 70% 50%)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons by Difficulty */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Lessons by Difficulty</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data?.lessonsByDifficulty ?? []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="difficulty" tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {data?.lessonsByDifficulty.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Practice by Mode */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-4 h-4 text-chart-2" />
            <h2 className="font-semibold text-sm">Practice by Mode</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data?.practiceByMode ?? []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="mode" tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {data?.practiceByMode.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Shortcuts by Category */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-chart-3" />
            <h2 className="font-semibold text-sm">Shortcuts by Category</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data?.shortcutsByCategory ?? []} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {data?.shortcutsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
