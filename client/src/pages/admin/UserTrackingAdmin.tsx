import { useEffect, useState } from "react";
import { getTrackingStats } from "@/lib/apiClient";


export default function UserTrackingAdmin() {
  const [stats, setStats] = useState({
  totalVisitors: 0,
  uniqueVisitors: 0,
  visitorsToday: 0,
  visitorsThisWeek: 0,
  totalPracticeSessions: 0,
  
});
const [lessonStats, setLessonStats] = useState<any[]>([]);
  const [shortcutStats, setShortcutStats] = useState<any[]>([]);
useEffect(() => {
  getTrackingStats()
    .then((data) => setStats(data))
    .catch(console.error);
    fetch(`${import.meta.env.VITE_API_URL}/api/lesson-stats`)
  .then((r) => r.json())
  .then(setLessonStats);

fetch(`${import.meta.env.VITE_API_URL}/api/shortcut-stats`)
  .then((r) => r.json())
  .then(setShortcutStats);
}, []);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-sm text-muted-foreground">Total Visitors</h2>
          <p className="text-3xl font-bold">{stats.totalVisitors}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-sm text-muted-foreground">Unique Visitors</h2>
          <p className="text-3xl font-bold">{stats.uniqueVisitors}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-sm text-muted-foreground">Visitors Today</h2>
          <p className="text-3xl font-bold">{stats.visitorsToday}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-sm text-muted-foreground">Visitors This Week</h2>
          <p className="text-3xl font-bold">{stats.visitorsThisWeek}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-sm text-muted-foreground">Total Practice Sessions</h2>
          <p className="text-3xl font-bold">{stats.totalPracticeSessions}</p>
        </div>
      </div>
      <div className="mt-8">
  <h2 className="text-xl font-bold mb-4">Top Viewed Lessons</h2>

  {lessonStats.map((lesson: any) => (
    <div key={lesson.id} className="border rounded p-3 mb-2">
      Lesson #{lesson.lessonId} - {lesson.views} views
    </div>
  ))}
</div>

<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">Most Used Shortcuts</h2>

  {shortcutStats.map((shortcut: any) => (
    <div key={shortcut.id} className="border rounded p-3 mb-2">
      Shortcut #{shortcut.shortcutId} - {shortcut.views} uses
    </div>
  ))}
</div>
      
    </div>
  );
}