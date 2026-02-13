import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShieldCheckLogo from "@/components/ShieldCheckLogo";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = location.pathname === "/dashboard";
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheckLogo size={26} />
          <span className="font-display text-xl font-bold tracking-tight">
            Veri<span className="text-primary">Clause</span> AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isDashboard ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </Link>
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/signin">Sign In</Link>
            </Button>
          )}
          {!isDashboard && (
            <Button asChild size="sm">
              <Link to="/dashboard">Analyze Contract</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="flex flex-col gap-3 p-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">
                Home
              </Link>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">
                Dashboard
              </Link>
              {user ? (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </Button>
              ) : (
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link to="/signin" onClick={() => setMobileOpen(false)}>Sign In</Link>
                </Button>
              )}
              <Button asChild size="sm" className="w-full">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Analyze Contract</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
