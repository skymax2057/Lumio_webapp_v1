"use client";

import { useLumioStore } from "@/lib/store";
import { Compass, Flame, Moon, Palette, Smile, Sparkles, Sun, Zap } from "lucide-react";

const LUMINA_MOODS = [
  { slug: "all", label: "Tous les Moods", icon: Palette, color: "text-violet-400" },
  { slug: "calme", label: "Calme", icon: Sun, color: "text-amber-300" },
  { slug: "énergique", label: "Énergique", icon: Zap, color: "text-yellow-400" },
  { slug: "mystérieuse", label: "Mystérieuse", icon: Moon, color: "text-purple-400" },
  { slug: "sereine", label: "Sereine", icon: Compass, color: "text-sky-300" },
  { slug: "minimaliste", label: "Minimaliste", icon: Sparkles, color: "text-zinc-300" },
  { slug: "vibrante", label: "Vibrante", icon: Flame, color: "text-rose-400" },
  { slug: "chaleureuse", label: "Chaleureuse", icon: Smile, color: "text-orange-300" },
];

export function MoodFilter() {
  const { selectedMood, setSelectedMood } = useLumioStore();

  return (
    <div className="w-full space-y-4 mb-8 bg-card border border-violet-500/20 p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-violet-500" />
        <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">
          Lumina Mood — Filtrer par Ambiance
        </h4>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {LUMINA_MOODS.map((m) => {
          const isActive = selectedMood === m.slug;

          return (
            <button
              key={m.slug}
              onClick={() => setSelectedMood(m.slug)}
              className={`px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 border shrink-0 hover:scale-105 ${isActive
                  ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white border-transparent shadow-lg shadow-violet-500/30"
                  : "bg-card border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-400 hover:shadow-md hover:shadow-violet-500/10"
                }`}
            >
              <span className="capitalize">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
