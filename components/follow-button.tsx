"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2, Users, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { GlowEffect } from "./glow-effect";

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
  onFollowChange?: () => void;
  mutualCount?: number;
  isFollowBack?: boolean;
  showMutualInfo?: boolean;
  variant?: "cosmic" | "aurora" | "nebula" | "plasma";
}

export function FollowButton({ 
  targetUserId, 
  className = "", 
  onFollowChange,
  mutualCount = 0,
  isFollowBack = false,
  showMutualInfo = false,
  variant = "cosmic"
}: FollowButtonProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      setIsOwnProfile(session.user.id === targetUserId);
      fetchFollowStatus();
    }
  }, [session, targetUserId]);

  const fetchFollowStatus = async () => {
    try {
      const res = await fetch(`/api/follow/${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
        setIsOwnProfile(data.isOwnProfile);
      }
    } catch (error) {
      console.error("Error fetching follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setIsAnimating(true);
    try {
      const res = await fetch(`/api/follow/${targetUserId}`, {
        method: 'POST',
      });
      
      if (res.ok) {
        setFollowing(true);
        onFollowChange?.();
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const handleUnfollow = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/follow/${targetUserId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setFollowing(false);
        onFollowChange?.();
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setLoading(false);
    }
  };

  const glowVariant = variant === "cosmic" ? "multi-layer" : 
                     variant === "aurora" ? "aurora" : 
                     variant === "nebula" ? "inner" : "multi-layer";

  if (isOwnProfile) {
    return null;
  }

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col gap-1">
        <GlowEffect variant={glowVariant}>
          <button
            className={`px-4 py-2 rounded-full glass-premium border border-violet-500/30 text-violet-400 text-xs font-semibold hover:border-violet-500/50 hover:bg-violet-500/10 transition-all flex items-center gap-2 hover:scale-105 ${className}`}
            onClick={() => window.location.href = '/login'}
          >
            <UserPlus className="w-4 h-4" />
            Suivre
          </button>
        </GlowEffect>
        {showMutualInfo && mutualCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{mutualCount} connexions</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <GlowEffect variant={glowVariant}>
        <button
          onClick={following ? handleUnfollow : handleFollow}
          disabled={loading}
          className={`
            relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 glass-premium border
            ${following
              ? "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-glow-rose hover:bg-rose-500/30"
              : isFollowBack
              ? "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 shadow-glow-rose"
              : "bg-violet-500/15 border-violet-500/40 text-violet-400 hover:bg-violet-500/25 hover:border-violet-500/60 shadow-glow-gold"
            }
            ${isAnimating ? 'scale-110' : 'hover:scale-105'}
            ${loading ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
        >
          {/* Sparkle effect on follow */}
          {isAnimating && !following && (
            <>
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-ping" />
              <Sparkles className="absolute -bottom-1 -left-1 w-2 h-2 text-pink-400 animate-ping" style={{ animationDelay: '0.1s' }} />
            </>
          )}
          
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : following ? (
            <>
              <UserCheck className="w-4 h-4" />
              Abonné
            </>
          ) : isFollowBack ? (
            <>
              <UserPlus className="w-4 h-4" />
              Suivre en retour
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Suivre
            </>
          )}
        </button>
      </GlowEffect>
      {showMutualInfo && mutualCount > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{mutualCount} connexions</span>
        </div>
      )}
    </div>
  );
}
