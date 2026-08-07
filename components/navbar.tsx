"use client";

import { NotificationsPopover } from "@/components/notifications-popover";
import { SuggestionsPanel } from "@/components/suggestions-panel";
import { GoldenRippleButton } from "@/components/ui/golden-ripple-button";
import { SlidePanel } from "@/components/ui/slide-panel";
import { useLumioStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  FolderHeart,
  Grid,
  LogOut,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  Users,
  X
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { softGlowEnabled, toggleSoftGlow, searchQuery, setSearchQuery } = useLumioStore();

  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="LUMIO Logo"
            className="w-10 h-10 rounded-lg object-contain"
          />
          <span className="font-bold text-lg bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
            LUMIO
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md hidden md:flex items-center relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher des œuvres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2">
          {/* Collections Link */}
          <Link
            href="/collections"
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 border transition-all duration-300 hover:scale-105 ${pathname === "/collections"
                ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white border-transparent shadow-lg shadow-violet-500/30"
                : "bg-card border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-400 hover:shadow-md hover:shadow-violet-500/10"
              }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span className="hidden lg:inline">Collections</span>
          </Link>

          {/* Create Button */}
          <Link
            href="/create"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold text-sm flex items-center gap-1.5 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Publier</span>
          </Link>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-violet-400 hover:border-violet-500/50 hover:shadow-md hover:shadow-violet-500/10 transition-all duration-300"
              title="Changer de thème"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Notifications */}
          <NotificationsPopover />

          {/* User Account / Profile */}
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-card hover:border-violet-500/50 hover:shadow-md hover:shadow-violet-500/10 transition-all duration-300"
              >
                <img
                  src={session.user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                  alt={session.user.name || "Profil"}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 z-50 rounded-2xl border border-border bg-card p-2 shadow-xl shadow-violet-500/10 space-y-1 text-sm">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="font-semibold text-foreground truncate">{session.user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                    >
                      <Grid className="w-4 h-4" /> Mes Créations
                    </Link>

                    <Link
                      href={`/profile/${session.user.id}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                    >
                      <User className="w-4 h-4" /> Profil Public
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Paramètres
                    </Link>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-card border border-border text-foreground hover:border-violet-500/50 hover:text-violet-400 hover:shadow-md hover:shadow-violet-500/10 text-sm font-semibold transition-all duration-300"
              >
                Inscription
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Connexion
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Suggestions Panel */}
      <SuggestionsPanel
        isOpen={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
      />
    </header>
  );
}
