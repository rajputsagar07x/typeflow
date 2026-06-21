import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Keyboard, Zap, Target, TrendingUp, BookOpen, Command, ChevronRight, Check } from "lucide-react";

const HOMEPAGE_DEFAULTS: Record<string, string> = {
  hero_title: "Learn. Practice.\nMaster Typing.",
  hero_subtitle: "Master typing and keyboard productivity skills through structured learning. Track your progress, analyze your weak spots, and reach typing mastery.",
  features_title: "Everything you need to reach typing mastery",
  features_subtitle: "A complete toolkit for serious typists. No bloat, no distractions.",
  faq_title: "Frequently Asked Questions",
  cta_title: "Ready to become a faster typist?",
  cta_subtitle: "Start with the home row. Everything else follows.",
  footer_text: "All progress stored locally in your browser.",
};

function useHomepageContent() {
  const [content, setContent] = useState<Record<string, string>>(HOMEPAGE_DEFAULTS);
  useEffect(() => {
    fetch("/api/homepage")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setContent({ ...HOMEPAGE_DEFAULTS, ...data }); })
      .catch(() => {});
  }, []);
  const get = (key: string) => content[key] ?? HOMEPAGE_DEFAULTS[key] ?? "";
  return get;
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "Structured Lessons",
    desc: "8 progressive levels from home row fundamentals to expert paragraph practice. Every keystroke builds on the last.",
  },
  {
    icon: Zap,
    title: "Live Practice Modes",
    desc: "Words, paragraphs, quotes, and code. Real-time WPM and accuracy tracking with character-level mistake highlighting.",
  },
  {
    icon: Target,
    title: "Weak Key Analysis",
    desc: "Intelligent tracking of your most frequently mistyped keys. Targeted recommendations to fix your weak spots.",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    desc: "Historical WPM and accuracy charts. Watch your improvement compound over days and weeks of consistent practice.",
  },
  {
    icon: Command,
    title: "Keyboard Shortcuts",
    desc: "Learn and practice the most powerful keyboard shortcuts. Interactive trainer detects your input in real time.",
  },
  {
    icon: Keyboard,
    title: "Guest Mode",
    desc: "No account required. Your progress is saved locally. Start practicing immediately — no friction, no signup.",
  },
];

const levels = [
  { level: 1, name: "Home Row", desc: "ASDF JKL; — the foundation", tag: "Beginner" },
  { level: 2, name: "Top Row", desc: "QWERTY UIOP — reach upward", tag: "Beginner" },
  { level: 3, name: "Bottom Row", desc: "ZXCVBNM — complete the map", tag: "Beginner" },
  { level: 4, name: "Numbers", desc: "Digits without looking down", tag: "Intermediate" },
  { level: 5, name: "Symbols", desc: "Special characters and punctuation", tag: "Intermediate" },
  { level: 6, name: "Paragraphs", desc: "Flow through full sentences", tag: "Advanced" },
  { level: 7, name: "Advanced", desc: "Complex mixed content at speed", tag: "Advanced" },
  { level: 8, name: "Expert", desc: "Elite-level mastery texts", tag: "Expert" },
];

const faqs = [
  {
    q: "Do I need to create an account?",
    a: "No. TypeFlow works entirely in guest mode. All your progress, stats, and completed lessons are saved in your browser's local storage.",
  },
  {
    q: "How long will it take to improve my typing speed?",
    a: "Most users see measurable improvement within 2-3 weeks of daily practice. Focus on accuracy first — speed follows naturally.",
  },
  {
    q: "What is the best way to use the lessons?",
    a: "Complete them in order. Each level builds on the last. Aim for 95%+ accuracy before moving to the next level.",
  },
  {
    q: "How does the weak key analysis work?",
    a: "TypeFlow tracks every mistake you make during practice sessions. Keys you frequently mistype are ranked and shown in your Analytics page with targeted recommendations.",
  },
  {
    q: "What practice mode should I start with?",
    a: "Start with Words mode at 60 seconds. Once you're comfortable, move to Paragraphs for flow practice, then Code if you're a developer.",
  },
];

export default function Landing() {
  const get = useHomepageContent();
  const heroLines = get("hero_title").split("\n");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm tracking-tight">TypeFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="nav-dashboard-link">
                Dashboard
              </span>
            </Link>
            <Link href="/practice">
              <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors" data-testid="nav-practice-btn">
                Practice Now
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-8"
          >
            <Zap className="w-3 h-3" />
            No account required — start instantly
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
            data-testid="hero-headline"
          >
            {heroLines[0]}
            {heroLines.length > 1 && (
              <>
                <br />
                <span className="gradient-text">{heroLines[1]}</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            data-testid="hero-subheadline"
          >
            {get("hero_subtitle")}
          </motion.p>
            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
  className="flex flex-col sm:flex-row items-center justify-center gap-4"
>
            <Link href="/lessons">
              <button
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-base font-bold hover:bg-primary/90 active:scale-[0.98] transition-all glow-primary"
                data-testid="hero-start-learning"
              >
                Start Learning
              </button>
            </Link>
            <Link href="/practice">
              <button
                className="bg-secondary text-secondary-foreground border border-border px-8 py-3 rounded-lg text-base font-semibold hover:bg-accent transition-all"
                data-testid="hero-practice-now"
              >
                Practice Now
              </button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-12 text-sm"
          >
            {[
              { value: "8", label: "Lesson Levels" },
              { value: "4", label: "Practice Modes" },
              { value: "15+", label: "Shortcuts" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" data-testid="features-heading">{get("features_title")}</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {get("features_subtitle")}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeIn key={f.title} delay={i * 0.07}>
                  <div className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/30 transition-colors h-full">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-24 px-6 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Structured Learning Path</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              8 carefully designed levels that build your skills progressively.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {levels.map((l, i) => (
              <FadeIn key={l.level} delay={i * 0.05}>
                <Link href="/lessons">
                  <div className="bg-card border border-card-border rounded-xl p-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        L{l.level}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        l.tag === "Expert" ? "bg-destructive/20 text-destructive" :
                        l.tag === "Advanced" ? "bg-chart-3/20 text-chart-3" :
                        l.tag === "Intermediate" ? "bg-chart-2/20 text-chart-2" :
                        "bg-chart-4/20 text-chart-4"
                      }`}>
                        {l.tag}
                      </span>
                    </div>
                    <div className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.desc}</div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Keyboard Productivity */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <div className="text-primary text-sm font-semibold mb-4 flex items-center gap-2">
                  <Command className="w-4 h-4" />
                  Keyboard Shortcuts
                </div>
                <h2 className="text-3xl font-bold mb-6">Master the shortcuts that save hours</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Power users accomplish in seconds what others take minutes. TypeFlow teaches you the most impactful keyboard shortcuts through an interactive trainer — not just reading a list, but actually pressing the keys.
                </p>
                <div className="space-y-3">
                  {["Interactive practice with real keyboard detection", "Success and error feedback animations", "Progress tracking across sessions", "Grouped by category for systematic learning"].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/shortcuts">
                  <button className="mt-8 flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all" data-testid="shortcuts-link">
                    Explore Shortcuts <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-card border border-card-border rounded-2xl p-6 space-y-3">
                {[
                  { keys: ["Ctrl", "C"], desc: "Copy" },
                  { keys: ["Ctrl", "V"], desc: "Paste" },
                  { keys: ["Ctrl", "Z"], desc: "Undo" },
                  { keys: ["Alt", "Tab"], desc: "Switch Windows" },
                  { keys: ["Ctrl", "S"], desc: "Save" },
                ].map((s) => (
                  <div key={s.desc} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-background border border-border">
                    <span className="text-sm text-muted-foreground">{s.desc}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={k}>
                          <kbd className="px-2 py-0.5 rounded bg-secondary border border-border text-xs font-mono font-semibold text-foreground">{k}</kbd>
                          {i < s.keys.length - 1 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Why TypeFlow */}
      <section className="py-24 px-6 border-t border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-6">Why TypeFlow</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              Most typing tools are either too basic or too gamified. TypeFlow is built for people who take their productivity seriously — structured enough to produce real results, focused enough to stay out of your way.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "No Distractions", desc: "Clean interface designed to keep you focused on what matters — the text in front of you." },
              { title: "Real Progress", desc: "Accurate metrics and trend charts show your actual improvement, not vanity numbers." },
              { title: "Privacy First", desc: "All data lives in your browser. No tracking, no accounts, no data leaving your device." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="bg-card border border-card-border rounded-xl p-6 text-left">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{get("faq_title")}</h2>
          </FadeIn>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={faq.q} delay={i * 0.05}>
                <div className="bg-card border border-card-border rounded-xl p-6">
                  <h3 className="font-semibold mb-2 text-foreground">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border/50 bg-card/30">
        <FadeIn className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
            <Keyboard className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{get("cta_title")}</h2>
          <p className="text-muted-foreground mb-8 text-lg">{get("cta_subtitle")}</p>
          <Link href="/lessons">
            <button className="bg-primary text-primary-foreground px-10 py-3.5 rounded-lg text-base font-bold hover:bg-primary/90 transition-all glow-primary" data-testid="cta-start-learning">
              Start Learning — Free
            </button>
          </Link>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Keyboard className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">TypeFlow</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/lessons", label: "Lessons" },
              { href: "/practice", label: "Practice" },
              { href: "/analytics", label: "Analytics" },
              { href: "/shortcuts", label: "Shortcuts" },
            ].map((l) => (
              <Link key={l.href} href={l.href}>
                <span className="hover:text-foreground transition-colors cursor-pointer">{l.label}</span>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{get("footer_text")}</p>
        </div>
      </footer>
    </div>
  );
}
