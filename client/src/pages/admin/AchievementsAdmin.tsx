import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, Loader2, Trophy } from "lucide-react";
import { adminAchievements, type AdminAchievement } from "@/lib/adminApi";

const REQUIREMENTS = [
  { value: "wpm", label: "Reach WPM" },
  { value: "sessions", label: "Complete Sessions" },
  { value: "lessons_completed", label: "Complete Lessons" },
  { value: "accuracy", label: "Reach Accuracy %" },
  { value: "practice_minutes", label: "Practice Minutes" },
];

const ICONS = ["trophy", "zap", "target", "star", "award", "flame", "crown", "bolt", "rocket", "keyboard"];

interface AchievementForm {
  title: string;
  description: string;
  xpValue: number;
  requirement: string;
  requirementValue: number;
  icon: string;
}

const emptyForm = (): AchievementForm => ({
  title: "", description: "", xpValue: 10, requirement: "wpm", requirementValue: 60, icon: "trophy",
});

function AchievementFormPanel({
  initial, onSave, onCancel, saving,
}: {
  initial: AchievementForm; onSave: (f: AchievementForm) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<AchievementForm>(initial);
  const set = (k: keyof AchievementForm) => (v: string) =>
    setForm((p) => ({ ...p, [k]: k === "xpValue" || k === "requirementValue" ? Number(v) : v }));

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
          <input value={form.title} onChange={(e) => set("title")(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
            placeholder="Speed Demon" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">XP Value</label>
          <input type="number" value={form.xpValue} onChange={(e) => set("xpValue")(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => set("description")(e.target.value)} rows={2}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
            placeholder="Describe this achievement…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Requirement</label>
          <select value={form.requirement} onChange={(e) => set("requirement")(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50">
            {REQUIREMENTS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Requirement Value</label>
          <input type="number" value={form.requirementValue} onChange={(e) => set("requirementValue")(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Icon</label>
          <div className="flex flex-wrap gap-1.5">
            {ICONS.map((ic) => (
              <button key={ic} onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${form.icon === ic ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button onClick={() => onSave(form)} disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          data-testid="achievement-save-btn">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
        <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export default function AchievementsAdmin() {
  const [items, setItems] = useState<AdminAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminAchievements.list().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form: AchievementForm) => {
    setSaving(true);
    try { await adminAchievements.create(form); load(); setCreating(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (id: number, form: AchievementForm) => {
    setSaving(true);
    try { await adminAchievements.update(id, form); load(); setEditId(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this achievement?")) return;
    try { await adminAchievements.delete(id); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  };

  const reqLabel = (r: string) => REQUIREMENTS.find((x) => x.value === r)?.label ?? r;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1" data-testid="achievements-admin-heading">Achievements</h1>
          <p className="text-sm text-muted-foreground">{items.length} achievements defined</p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="create-achievement-btn">
            <Plus className="w-4 h-4" /> New Achievement
          </button>
        )}
      </div>

      {error && <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm">{error}</div>}

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AchievementFormPanel initial={emptyForm()} onSave={handleCreate} onCancel={() => setCreating(false)} saving={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card border border-card-border rounded-xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-sm text-muted-foreground">No achievements yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id}>
              <AnimatePresence mode="wait">
                {editId === item.id ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <AchievementFormPanel
                      initial={{ title: item.title, description: item.description, xpValue: item.xpValue, requirement: item.requirement, requirementValue: item.requirementValue, icon: item.icon }}
                      onSave={(f) => handleUpdate(item.id, f)}
                      onCancel={() => setEditId(null)}
                      saving={saving}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card border border-card-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{item.title}</div>
                          <div className="text-xs text-primary font-medium">+{item.xpValue} XP</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditId(item.id)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" data-testid={`edit-achievement-${item.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" data-testid={`delete-achievement-${item.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="text-xs bg-muted rounded px-2 py-1 inline-block">
                      {reqLabel(item.requirement)}: <span className="font-semibold text-foreground">{item.requirementValue}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
