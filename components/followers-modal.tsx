"use client";

import { useState, useEffect } from "react";
import { X, Users, UserPlus, Loader2 } from "lucide-react";
import { FollowButton } from "./follow-button";

interface User {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  followersCount: number;
  isVerified: boolean;
  isPro: boolean;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following";
}

export function FollowersModal({ isOpen, onClose, userId, type }: FollowersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setUsers([]);
      setOffset(0);
      setHasMore(true);
      fetchUsers(0);
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async (currentOffset: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const endpoint = type === "followers" 
        ? `/api/user/${userId}/followers` 
        : `/api/user/${userId}/following`;
      
      const res = await fetch(`${endpoint}?limit=20&offset=${currentOffset}`);
      if (res.ok) {
        const data = await res.json();
        const newUsers = type === "followers" ? data.followers : data.following;
        
        if (currentOffset === 0) {
          setUsers(newUsers);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
        }
        
        setHasMore(data.hasMore);
        setOffset(currentOffset + newUsers.length);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchUsers(offset);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-lumio-card border border-lumio-border rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-lumio-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-400" />
            <h2 className="font-display font-bold text-lg text-foreground">
              {type === "followers" ? "Abonnés" : "Abonnements"}
            </h2>
            <span className="text-xs text-muted-foreground">({users.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-lumio-dark transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {users.length === 0 && !loading ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {type === "followers" ? "Aucun abonné pour le moment" : "Aucun abonnement pour le moment"}
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-lumio-dark/50 border border-lumio-border hover:border-gold-500/30 transition-all"
              >
                <img
                  src={user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                  alt={user.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-lumio-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {user.name}
                    </h3>
                    {user.isVerified && (
                      <span className="text-gold-400 text-xs">✓</span>
                    )}
                    {user.isPro && (
                      <span className="text-purple-400 text-xs">⭐</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.bio || "Créateur sur Lumio"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.followersCount} abonnés
                  </p>
                </div>
                <FollowButton targetUserId={user.id} />
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && !loading && users.length > 0 && (
          <div className="p-4 border-t border-lumio-border">
            <button
              onClick={loadMore}
              className="w-full py-2 rounded-lg bg-lumio-dark border border-lumio-border text-xs font-semibold text-foreground hover:border-gold-500/50 transition-all"
            >
              Charger plus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
