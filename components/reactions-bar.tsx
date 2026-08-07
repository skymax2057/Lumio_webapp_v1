"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

interface ReactionCount {
  emoji: string;
  count: number;
}

interface ReactionsBarProps {
  imageId: string;
  className?: string;
}

export function ReactionsBar({ imageId, className = "" }: ReactionsBarProps) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [availableReactions] = useState(["❤️", "🔥", "✨", "🎨", "💯", "👏", "😍", "🌟"]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [imageId]);

  const fetchReactions = async () => {
    try {
      const res = await fetch(`/api/images/${imageId}/reactions`);
      if (res.ok) {
        const data = await res.json();
        setReactions(data.reactions);
        setUserReactions(data.userReactions);
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const hasReacted = userReactions.includes(emoji);

      if (hasReacted) {
        // Remove reaction
        await fetch(`/api/images/${imageId}/reactions?emoji=${encodeURIComponent(emoji)}`, {
          method: 'DELETE',
        });
        setUserReactions(prev => prev.filter(r => r !== emoji));
        setReactions(prev => prev.map(r => 
          r.emoji === emoji ? { ...r, count: r.count - 1 } : r
        ).filter(r => r.count > 0));
      } else {
        // Add reaction
        await fetch(`/api/images/${imageId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
        });
        setUserReactions(prev => [...prev, emoji]);
        
        const existingReaction = reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          setReactions(prev => prev.map(r => 
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          ));
        } else {
          setReactions(prev => [...prev, { emoji, count: 1 }]);
        }
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Top reactions */}
        <div className="flex items-center gap-1">
          {reactions.slice(0, 3).map((reaction) => {
            const hasReacted = userReactions.includes(reaction.emoji);
            return (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                disabled={loading || !session?.user?.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                  hasReacted
                    ? "bg-violet-500/20 border border-violet-500/50 scale-110"
                    : "bg-lumio-dark border border-lumio-border hover:border-violet-500/30"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${
                  !session?.user?.id ? "cursor-pointer" : ""
                }`}
                title={session?.user?.id ? "Cliquez pour réagir" : "Connectez-vous pour réagir"}
              >
                <span className="text-sm">{reaction.emoji}</span>
                <span className="text-xs text-foreground">{reaction.count}</span>
              </button>
            );
          })}
        </div>

        {/* Reaction picker button */}
        <button
          onClick={() => {
            if (session?.user?.id) {
              setShowPicker(!showPicker);
            } else {
              window.location.href = '/login';
            }
          }}
          className="px-2 py-1 rounded-full bg-lumio-dark border border-lumio-border text-xs text-muted-foreground hover:border-violet-500/50 transition-all"
          title="Ajouter une réaction"
        >
          {totalReactions > 3 && <span className="mr-1">+{totalReactions - 3}</span>}
          <span className="text-sm">😊</span>
        </button>
      </div>

      {/* Reaction picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 p-2 bg-lumio-card border border-lumio-border rounded-xl shadow-2xl z-10"
          >
            <div className="grid grid-cols-4 gap-1">
              {availableReactions.map((emoji) => {
                const hasReacted = userReactions.includes(emoji);
                return (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleReaction(emoji);
                      setShowPicker(false);
                    }}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg text-2xl transition-all hover:scale-110 ${
                      hasReacted
                        ? "bg-violet-500/20 border border-violet-500/50"
                        : "bg-lumio-dark border border-lumio-border hover:border-violet-500/30"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
