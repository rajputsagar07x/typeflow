import { Link } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-xl font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6 text-sm">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <button className="flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
