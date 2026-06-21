import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Check, RefreshCw } from "lucide-react";
import { adminHomepage } from "@/lib/adminApi";

const FIELDS: { key: string; label: string; textarea?: boolean; description: string }[] = [
  { key: "hero_title", label: "Hero Title", textarea: true, description: "Main headline shown on the landing page" },
  { key: "hero_subtitle", label: "Hero Subtitle", textarea: true, description: "Supporting text under the hero title" },
  { key: "features_title", label: "Features Section Title", description: "Heading for the features grid" },
  { key: "features_subtitle", label: "Features Section Subtitle", textarea: true, description: "Subtext under the features heading" },
  { key: "faq_title", label: "FAQ Title", description: "Heading for the FAQ section" },
  { key: "cta_title", label: "CTA Title", description: "Call-to-action heading at the bottom" },
  { key: "cta_subtitle", label: "CTA Subtitle", description: "Supporting text for the CTA section" },
  { key: "footer_text", label: "Footer Text", description: "Small text shown in the site footer" },
];

export default function HomepageAdmin() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminHomepage.get()
      .then(setContent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await adminHomepage.update(content);
      setContent(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: string) =>
    setContent((p) => ({ ...p, [key]: value }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card border border-card-border rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold mb-1" data-testid="homepage-admin-heading">Homepage Content</h1>
          <p className="text-sm text-muted-foreground">Edit the text shown on the public landing page.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            data-testid="homepage-save-btn"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && <div className="text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm">{error}</div>}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-chart-4/10 border border-chart-4/20 text-chart-4 rounded-xl p-3 text-sm"
        >
          <Check className="w-4 h-4" />
          Changes saved successfully.
        </motion.div>
      )}

      <div className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key} className="bg-card border border-card-border rounded-xl p-5">
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-0.5">{field.label}</label>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
            {field.textarea ? (
              <textarea
                value={content[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none transition-colors"
                data-testid={`homepage-field-${field.key}`}
              />
            ) : (
              <input
                value={content[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                data-testid={`homepage-field-${field.key}`}
              />
            )}
            <div className="mt-1.5 text-xs text-muted-foreground">
              Key: <code className="bg-muted px-1 rounded">{field.key}</code>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
