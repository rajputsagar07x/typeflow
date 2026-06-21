import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Keyboard, Lock, AlertCircle, Loader2 } from "lucide-react";
import { login, isLoggedIn, checkAdminStatus } from "@/lib/adminApi";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoggedIn()) {
      setLocation("/owner-admin/dashboard");
      return;
    }
    checkAdminStatus().then((s) => setConfigured(s.configured)).catch(() => setConfigured(false));
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      setLocation("/owner-admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Keyboard className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-1">TypeFlow Admin</h1>
          <p className="text-sm text-muted-foreground">Owner access only</p>
        </div>

        {configured === false && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">Admin not configured</div>
              <div className="text-xs opacity-80">
                Set <code className="bg-destructive/20 px-1 rounded">OWNER_EMAIL</code> and{" "}
                <code className="bg-destructive/20 px-1 rounded">OWNER_PASSWORD</code> environment
                variables to enable admin access.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
              placeholder="owner@example.com"
              required
              autoComplete="email"
              data-testid="admin-email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              data-testid="admin-password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || configured === false}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            data-testid="admin-login-btn"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
      