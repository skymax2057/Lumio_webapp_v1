"use client";

import { useState, useEffect } from "react";
import { UserPlus, Sparkles, X, Loader2 } from "lucide-react";
import { FollowButton } from "./follow-button";
import { useSession } from "next-auth/react";

interface SuggestedUser {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  followersCount: number;
  isVerified: boolean;
  isPro: boolean;
  reasons: string[];
  mutualCount?: number;
  isFollowBack?: boolean;
  imageCount?: number;
}

interface SuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestionsPanel({ isOpen, onClose }: SuggestionsPanelProps) {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchSuggestions();
    }
  }, [isOpen, session]);

  const fetchSuggestions = async () => {
    if (!session?.user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/suggestions");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
      } else if (res.status === 401) {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowAction = () => {
    // Refresh suggestions after a short delay to allow follow action to complete
    setTimeout(() => {
      fetchSuggestions();
    }, 500);
  };

  const handleDismiss = (userId: string) => {
    setSuggestions(prev => prev.filter(user => user.id !== userId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-lumio-card border-l border-lumio-border shadow-2xl z-50 flex flex-col luxury-border corner-accent slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-lumio-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h2 className="font-display font-bold text-lg text-foreground gold-underline">
            Suggestions
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-lumio-dark transition-colors touch-press-effect"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!session?.user ? (
          <div className="text-center py-8 px-4">
            <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium mb-2">
              Connectez-vous pour découvrir des créateurs
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Les suggestions personnalisées sont disponibles pour les membres connectés
            </p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Aucune suggestion pour le moment
          </div>
        ) : (
          suggestions.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-xl bg-lumio-dark/50 border border-lumio-border hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={
                    user.image ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                  }
                  alt={user.name || "User"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-lumio-border"
                />
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => handleDismiss(user.id)}
                    className="float-right p-1 rounded-full hover:bg-lumio-dark text-muted-foreground hover:text-foreground transition-colors"
                    title="Masquer cette suggestion"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {user.name}
                    </h3>
                    {user.isFollowBack && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-medium">
                        Vous suit
                      </span>
                    )}
                    {user.isVerified && (
                      <span className="text-violet-400 text-xs">✓</span>
                    )}
                    {user.isPro && (
                      <span className="text-purple-400 text-xs">⭐</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.bio || "Créateur sur Lumio"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{user.followersCount} abonnés</span>
                    {(user.imageCount ?? 0) > 0 && (
                      <span>• {user.imageCount} œuvres</span>
                    )}
                  </div>
                  {(user.mutualCount ?? 0) > 0 && (
                    <p className="text-xs text-violet-400 mt-1">
                      {user.mutualCount === 1 ? "1 connexion en commun" : `${user.mutualCount} connexions en commun`}
                    </p>
                  )}
                  
                  {/* Reasons */}
                  {user.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.reasons.map((reason, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px]"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <FollowButton 
                  targetUserId={user.id} 
                  onFollowChange={handleFollowAction}
                  mutualCount={user.mutualCount || 0}
                  isFollowBack={user.isFollowBack || false}
                  showMutualInfo={true}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-lumio-border">
        <button
          onClick={fetchSuggestions}
          className="w-full py-2 rounded-lg bg-lumio-dark border border-lumio-border text-xs font-semibold text-foreground hover:border-violet-500/50 transition-all flex items-center justify-center gap-2 touch-press-effect"
        >
          <Sparkles className="w-4 h-4" />
          Actualiser les suggestions
        </button>
      </div>
    </div>
  );
}
