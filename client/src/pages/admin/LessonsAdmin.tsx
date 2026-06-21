import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Loader2, Check, X } from "lucide-react";
import { adminLessons, type AdminLesson } from "@/lib/adminApi";

const DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];
const CATEGORIES = ["Foundation", "Intermediate", "Advanced", "Expert"];

type Mode = "list" | "create" | "edit";

interface LessonForm {
  level: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  instructions: string;
  content: string[];
}

const emptyForm = (): LessonForm => ({
  level: 1, title: "", description: "", category: "Foundation",
  difficulty: "beginner", estimatedMinutes: 10, instructions: "", content: [""],
});

function FieldInput({ label, value, onChange, textarea, type = "text" }: {
  label: string; value: string | number; onChange: (v: string) => void;
  textarea?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
        />
      )}
    </div>
  );
}

function LessonFormPanel({
  initial, onSave, onCancel, saving,
}: {
  initial: LessonForm; onSave: (f: LessonForm) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<LessonForm>(initial);

  const set = (k: keyof LessonForm) => (v: string) =>
    setForm((p) => ({ ...p, [k]: k === "level" || k === "estimatedMinutes" ? Number(v) : v }));

  const setContent = (i: number, v: string) =>
    setForm((p) => { const c = [...p.content]; c[i] = v; return { ...p, content: c }; });

  const addContent = () => setForm((p) => ({ ...p, content: [...p.content, ""] }));
  const removeContent = (i: number) =>
    setForm((p) => ({ ...p, content: p.content.filter((_, idx) => idx !== i) }));

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldInput label="Level" value={form.level} type="number" onChange={set("level")} />
        <FieldInput label="Title" value={form.title} onChange={set("title")} />
        <FieldInput label="Description" value={form.description} onChange={set("description")} textarea />
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => set("difficulty")(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
          >
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => set("category")(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <FieldInput label="Est. Minutes" value={form.estimatedMinutes} type="number" onChange={set("estimatedMinutes")} />
        <div className="sm:col-span-2">
          <FieldInput label="Instructions" value={form.instructions} onChange={set("instructions")} textarea />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted-foreground">Typing Content ({form.content.length} items)</label>
          <button onClick={addContent} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add item
          </button>
        </div>
        <div className="space-y-2">
          {form.content.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={c}
                onChange={(e) => setContent(i, e.target.value)}
                placeholder={`Content item ${i + 1}`}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary/50"
              />
              <button
                onClick={() => removeContent(i)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          data-testid="lesson-save-btn"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save Lesson
        </button>
        <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function LessonsAdmin() {
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("list");
  const [editTarget, setEditTarget] = useState<AdminLesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    adminLessons.list().then(setLessons).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form: LessonForm) => {
    setSaving(true);
    setError(null);
    try {
      await adminLessons.create({
        ...form,
        content: form.content.filter((c) => c.trim()),
      });
      load();
      setMode("list");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form: LessonForm) => {
    if (!editTarget) return;
    setSaving(true);
    setError(null);
    try {
      await adminLessons.update(editTarget.id, {
        ...form,
        content: form.content.filter((c) => c.trim()),
      });
      load();
      setMode("list");
      setEditTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lesson and all its content?")) return;
    setError(null);
    try {
      await adminLessons.delete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1" data-testid="lessons-admin-heading">Lessons</h1>
          <p className="text-sm text-muted-foreground">{lessons.length} lessons configured</p>
        </div>
        {mode === "list" && (
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="create-lesson-btn"
          >
            <Plus className="w-4 h-4" /> New Lesson
          </button>
        )}
      </div>

      {error && (
        <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm">{error}</div>
      )}

      <AnimatePresence>
        {mode === "create" && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <LessonFormPanel initial={emptyForm()} onSave={handleCreate} onCancel={() => setMode("list")} saving={saving} />
          </motion.div>
        )}
        {mode === "edit" && editTarget && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <LessonFormPanel
              initial={{
                level: editTarget.level,
                title: editTarget.title,
                description: editTarget.description,
                category: editTarget.category,
                difficulty: editTarget.difficulty,
                estimatedMinutes: editTarget.estimatedMinutes,
                instructions: editTarget.instructions,
                content: editTarget.content.map((c) => c.text),
              }}
              onSave={handleEdit}
              onCancel={() => { setMode("list"); setEditTarget(null); }}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-card border border-card-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  L{lesson.level}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{lesson.title}</div>
                  <div className="text-xs text-muted-foreground">{lesson.difficulty} · {lesson.content.length} exercises · {lesson.estimatedMinutes} min</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`expand-lesson-${lesson.id}`}
                  >
                    {expandedId === lesson.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditTarget(lesson); setMode("edit"); }}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`edit-lesson-${lesson.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    data-testid={`delete-lesson-${lesson.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === lesson.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">Instructions: {lesson.instructions}</div>
                      {lesson.content.map((c, i) => (
                        <div key={c.id} className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground w-4 mt-0.5">{i + 1}.</span>
                          <div className="flex-1 text-xs font-mono bg-background border border-border rounded px-2 py-1.5 text-foreground/80">
                            {c.text}
                          </div>
                        </div>
                      ))}
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
