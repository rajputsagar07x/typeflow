import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Keyboard, LayoutDashboard, BookOpen, Type, Command,
  Trophy, Globe, LogOut, ChevronRight, Menu, X,
} from "lucide-react";
import { isLoggedIn, logout } from "@/lib/adminApi";

const navItems = [
  { href: "/owner-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner-admin/lessons", label: "Lessons", icon: BookOpen },
  { href: "/owner-admin/content", label: "Practice Content", icon: Type },
  { href: "/owner-admin/shortcuts", label: "Shortcuts", icon: Command },
  { href: "/owner-admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/owner-admin/homepage", label: "Homepage", icon: Globe },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLocation("/owner-admin");
    }
  }, [setLocation]);

  const handleLogout = () => {
    logout();
    setLocation("/owner-admin");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:flex`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-xs font-bold leading-none">TypeFlow</div>
              <div className="text-[10px] text-muted-foreground leading-none mt-0.5">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    isActive
                      ? "bg-sidebar-primary/10 text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link href="/">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer transition-colors">
              <Globe className="w-4 h-4" />
              View Site
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
            data-testid="admin-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-12 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="text-sm font-medium text-muted-foreground">
            {navItems.find((n) => location === n.href || location.startsWith(n.href + "/"))?.label ?? "Admin"}
          </div>
          <div className="ml-auto text-xs text-muted-foreground bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
            Owner
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="p-6 max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
