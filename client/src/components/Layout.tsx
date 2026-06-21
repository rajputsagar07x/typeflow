import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Keyboard, BarChart2, BookOpen, Zap, Command } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/lessons", label: "Lessons", icon: BookOpen },
  { href: "/practice", label: "Practice", icon: Zap },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/shortcuts", label: "Shortcuts", icon: Command },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group" data-testid="nav-logo">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Keyboard className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                TypeFlow
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1" data-testid="main-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    data-testid={`nav-${item.label.toLowerCase()}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:block">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
