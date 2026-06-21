import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { adminShortcuts, type AdminShortcut } from "@/lib/adminApi";

const CATEGORIES = ["Editing", "File", "Navigation", "Browser", "System", "Formatting", "Developer"];

interface ShortcutForm {
  keys: string[];
  name: string;
  purpose: string;
  explanation: string;
  category: string;
}

const emptyForm = (): ShortcutForm => ({
  keys: ["Ctrl", ""], name: "", purpose: "", explanation: "", category: "Editing",
});

function ShortcutFormPanel({
  initial, onSave, onCancel, saving,
}: {
  initial: ShortcutForm; onSave: (f: ShortcutForm) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<ShortcutForm>(initial);

  const setKey = (i: number, v: string) =>
    setForm((p) => { const k = [...p.keys]; k[i] = v; return { ...p, keys: k }; });

  const addKey = () => setForm((p) => ({ ...p, keys: [...p.keys, ""] }));
  const removeKey = (i: number) =>
    setForm((p) => ({ ...p, keys: p.keys.filter((_, idx) => idx !== i) }));

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
            placeholder="e.g. Copy"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Purpose</label>
          <input
            value={form.purpose}
            onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
            placeholder="e.g. Copy selected text"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Keys
            <button onClick={addKey} className="ml-2 text-primary text-xs hover:underline">+ Add</button>
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {form.keys.map((k, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  value={k}
                  onChange={(e) => setKey(i, e.target.value)}
                  className="w-20 bg-background border border-border rounded px-2 py-1 text-xs font-mono outline-none focus:border-primary/50"
                  placeholder="Ctrl"
                />
                {form.keys.length > 1 && (
                  <button onClick={() => removeKey(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                )}
                {i < form.keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Explanation</label>
          <textarea
            value={form.explanation}
            onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
            rows={2}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none"
            placeholder="Describe when and how to use this shortcut…"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={() => onSave({ ...form, keys: form.keys.filter((k) => k.trim()) })}
          disabled={saving || !form.name.trim()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          data-testid="shortcut-save-btn"
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

export default function ShortcutsAdmin() {
  const [shortcuts, setShortcuts] = useState<AdminShortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const load = () => {
    setLoading(true);
    adminShortcuts.list().then(setShortcuts).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (form: ShortcutForm) => {
    setSaving(true);
    try {
      await adminShortcuts.create(form);
      load();
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number, form: ShortcutForm) => {
    setSaving(true);
    try {
      await adminShortcuts.update(id, form);
      load();
      setEditId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this shortcut?")) return;
    try {
      await adminShortcuts.delete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));
  const filtered = filterCat === "all" ? shortcuts : shortcuts.filter((s) => s.category === filterCat);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1" data-testid="shortcuts-admin-heading">Shortcuts</h1>
          <p className="text-sm text-muted-foreground">{shortcuts.length} shortcuts configured</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="create-shortcut-btn"
          >
            <Plus className="w-4 h-4" /> Add Shortcut
          </button>
        )}
      </div>

      {error && <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm">{error}</div>}

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ShortcutFormPanel initial={emptyForm()} onSave={handleCreate} onCancel={() => setCreating(false)} saving={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
        >
          All ({shortcuts.length})
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCat === c ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
          >
            {c} ({shortcuts.filter((s) => s.category === c).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card border border-card-border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id}>
              <AnimatePresence mode="wait">
                {editId === s.id ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ShortcutFormPanel
                      initial={{ keys: s.keys, name: s.name, purpose: s.purpose, explanation: s.explanation, category: s.category }}
                      onSave={(f) => handleUpdate(s.id, f)}
                      onCancel={() => setEditId(null)}
                      saving={saving}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {s.keys.map((k, i) => (
                        <span key={k}>
                          <kbd className="px-2 py-0.5 rounded bg-secondary border border-border text-xs font-mono font-semibold">{k}</kbd>
                          {i < s.keys.length - 1 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
                        </span>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.category} · {s.purpose}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditId(s.id)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" data-testid={`edit-shortcut-${s.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" data-testid={`delete-shortcut-${s.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-10 text-sm text-muted-foreground">No shortcuts in this category yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
