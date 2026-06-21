import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { adminPractice, type AdminPracticeText } from "@/lib/adminApi";

const MODES = ["words", "paragraphs", "quotes", "code"];

const modeColors: Record<string, string> = {
  words: "text-chart-4 bg-chart-4/10",
  paragraphs: "text-chart-2 bg-chart-2/10",
  quotes: "text-chart-3 bg-chart-3/10",
  code: "text-primary bg-primary/10",
};

interface FormState {
  mode: string;
  text: string;
}

function PracticeForm({
  initial, onSave, onCancel, saving,
}: {
  initial: FormState; onSave: (f: FormState) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mode</label>
          <select
            value={form.mode}
            onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
          >
            {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Text</label>
          <textarea
            value={form.text}
            onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 resize-none"
            placeholder="Enter the practice text…"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.text.trim()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          data-testid="practice-save-btn"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
        <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ContentAdmin() {
  const [items, setItems] = useState<AdminPracticeText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterMode, setFilterMode] = useState<string>("all");

  const load = () => {
    setLoading(true);
    adminPractice.list().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form: FormState) => {
    setSaving(true);
    try {
      await adminPractice.create(form);
      load();
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number, form: FormState) => {
    setSaving(true);
    try {
      await adminPractice.update(id, form);
      load();
      setEditId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this practice text?")) return;
    try {
      await adminPractice.delete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const filtered = filterMode === "all" ? items : items.filter((i) => i.mode === filterMode);
  const counts = MODES.reduce((acc, m) => ({ ...acc, [m]: items.filter((i) => i.mode === m).length }), {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1" data-testid="content-admin-heading">Practice Content</h1>
          <p className="text-sm text-muted-foreground">{items.length} texts across {MODES.length} modes</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="create-content-btn"
          >
            <Plus className="w-4 h-4" /> Add Text
          </button>
        )}
      </div>

      {error && (
        <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm">{error}</div>
      )}

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <PracticeForm initial={{ mode: "words", text: "" }} onSave={handleCreate} onCancel={() => setCreating(false)} saving={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterMode("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
        >
          All ({items.length})
        </button>
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filterMode === m ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
          >
            {m} ({counts[m] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-card border border-card-border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id}>
              <AnimatePresence mode="wait">
                {editId === item.id ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PracticeForm
                      initial={{ mode: item.mode, text: item.text }}
                      onSave={(f) => handleUpdate(item.id, f)}
                      onCancel={() => setEditId(null)}
                      saving={saving}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border border-card-border rounded-xl p-4 flex items-start gap-3"
                  >
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 mt-0.5 ${modeColors[item.mode] ?? "text-foreground bg-muted"}`}>
                      {item.mode}
                    </span>
                    <p className="flex-1 text-sm text-muted-foreground font-mono leading-relaxed line-clamp-2">
                      {item.text}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditId(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                        data-testid={`edit-content-${item.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        data-testid={`delete-content-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-10 text-sm text-muted-foreground">No content for this mode yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
