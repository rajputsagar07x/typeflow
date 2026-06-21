import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Lessons from "@/pages/Lessons";
import LessonDetail from "@/pages/LessonDetail";
import Practice from "@/pages/Practice";
import Analytics from "@/pages/Analytics";
import Shortcuts from "@/pages/Shortcuts";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import LessonsAdmin from "@/pages/admin/LessonsAdmin";
import ContentAdmin from "@/pages/admin/ContentAdmin";
import ShortcutsAdmin from "@/pages/admin/ShortcutsAdmin";
import AchievementsAdmin from "@/pages/admin/AchievementsAdmin";
import HomepageAdmin from "@/pages/admin/HomepageAdmin";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard"><Layout><Dashboard /></Layout></Route>
        <Route path="/lessons/:id"><Layout><LessonDetail /></Layout></Route>
        <Route path="/lessons"><Layout><Lessons /></Layout></Route>
        <Route path="/practice"><Layout><Practice /></Layout></Route>
        <Route path="/analytics"><Layout><Analytics /></Layout></Route>
        <Route path="/shortcuts"><Layout><Shortcuts /></Layout></Route>
        <Route path="/owner-admin" component={AdminLogin} />
        <Route path="/owner-admin/dashboard"><AdminLayout><AdminDashboard /></AdminLayout></Route>
        <Route path="/owner-admin/lessons"><AdminLayout><LessonsAdmin /></AdminLayout></Route>
        <Route path="/owner-admin/content"><AdminLayout><ContentAdmin /></AdminLayout></Route>
        <Route path="/owner-admin/shortcuts"><AdminLayout><ShortcutsAdmin /></AdminLayout></Route>
        <Route path="/owner-admin/achievements"><AdminLayout><AchievementsAdmin /></AdminLayout></Route>
        <Route path="/owner-admin/homepage"><AdminLayout><HomepageAdmin /></AdminLayout></Route>
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
