"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Heart,
  Eye,
  Users,
  FolderHeart,
  MessageSquare,
  Image,
  Flame,
  Clock,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

interface ProfileStats {
  level: number;
  levelName: string;
  xp: number;
  xpToNextLevel: number;
  nextLevelName: string;
  streakDays: number;
  totalTimeSpent: number;
}

interface Stats {
  images: number;
  likes: number;
  views: number;
  followers: number;
  collections: number;
  comments: number;
}

export default function StatsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileStats | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allDefinitions, setAllDefinitions] = useState<Achievement[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/achievements");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setStats(data.stats);
        setAchievements(data.achievements);
        setAllDefinitions(data.allDefinitions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const statCards = [
    { label: "Créations", value: stats?.images || 0, icon: Image, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Likes reçus", value: stats?.likes || 0, icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Vues", value: stats?.views || 0, icon: Eye, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Followers", value: stats?.followers || 0, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Collections", value: stats?.collections || 0, icon: FolderHeart, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Commentaires", value: stats?.comments || 0, icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  if (status === "loading" || (status === "unauthenticated" && loading)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gold-400 animate-pulse text-xs">Chargement...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-2xl md:text-3xl gold-gradient-text">
            Mes Statistiques
          </h1>
          <p className="text-xs text-muted-foreground">
            Suivez votre progression sur Lumio
          </p>
        </div>

        {/* Level & XP Card */}
        <div className="bg-lumio-card rounded-3xl border border-lumio-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-200 flex items-center justify-center shadow-lg shadow-gold-500/30">
                <Trophy className="w-8 h-8 text-lumio-dark" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Niveau {profile?.level || 1}</p>
                <p className="font-display font-bold text-xl text-foreground">{profile?.levelName || "Novice"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">XP</p>
              <p className="font-bold text-lg text-gold-400">{profile?.xp || 0}</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progression</span>
              <span className="text-gold-400">
                {profile?.xp || 0} / {(profile?.xp || 0) + (profile?.xpToNextLevel || 0)} XP
              </span>
            </div>
            <div className="h-3 rounded-full bg-lumio-dark overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((profile?.xp || 0) / ((profile?.xp || 0) + (profile?.xpToNextLevel || 0))) * 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-amber-500"
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">
              {profile?.xpToNextLevel || 0} XP restants pour atteindre {profile?.nextLevelName || "Max"}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03 }}
              className="bg-lumio-card rounded-2xl border border-lumio-border p-4 space-y-2"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-foreground">{stat.value.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Streak & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-lumio-card rounded-2xl border border-lumio-border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-foreground">{profile?.streakDays || 0}</p>
                <p className="text-xs text-muted-foreground">Jours consécutifs</p>
              </div>
            </div>
          </div>

          <div className="bg-lumio-card rounded-2xl border border-lumio-border p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-foreground">
                  {formatTime(profile?.totalTimeSpent || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Temps total passé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-lumio-card rounded-3xl border border-lumio-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Achievements</h2>
              <p className="text-xs text-muted-foreground">
                {achievements.length} / {allDefinitions.length} débloqués
              </p>
            </div>
          </div>

          {/* Earned Achievements */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gold-400 uppercase tracking-wider">Débloqués</h3>
            {achievements.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun achievement débloqué pour le moment.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 space-y-2"
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <p className="font-semibold text-gold-300 text-xs">{achievement.name}</p>
                      <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gold-400">
                      <Zap className="w-3 h-3" />
                      +{achievement.points} XP
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Available Achievements */}
          <div className="space-y-3 pt-4 border-t border-lumio-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">À débloquer</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allDefinitions
                .filter((a) => !achievements.find((ua) => ua.id === a.id))
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-lumio-dark border border-lumio-border rounded-2xl p-4 space-y-2 opacity-60"
                  >
                    <div className="text-3xl grayscale">{achievement.icon}</div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">{achievement.name}</p>
                      <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      +{achievement.points} XP
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs text-gold-400 hover:text-gold-300 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Retour au tableau de bord
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}