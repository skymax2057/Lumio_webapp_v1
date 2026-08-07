"use client";

import { Footer } from "@/components/footer";
import { ImageCard } from "@/components/image-card";
import { Lightbox } from "@/components/lightbox";
import { Navbar } from "@/components/navbar";
import { VisualEchoModal } from "@/components/visual-echo-modal";
import { ImageItem } from "@/lib/store";
import { Eye, Grid, Heart, PlusCircle, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [stats, setStats] = useState({ totalUploads: 0, totalLikes: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserCreations();
    }
  }, [session]);

  const fetchUserCreations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/creations");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-gold-500 mx-auto" />
          <h2 className="font-display font-bold text-xl">Accès restreint</h2>
          <p className="text-xs text-muted-foreground">
            Connectez-vous pour gérer vos créations.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-full bg-gold-500 text-lumio-dark font-bold text-xs"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lumio-border pb-6">
          <div className="flex items-center gap-4">
            <img
              src={session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-gold-500/50"
            />
            <div>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl gold-gradient-text">
                {session?.user?.name || "Créateur Lumio"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Tableau de bord — Gestion de vos œuvres
              </p>
            </div>
          </div>

          <Link
            href="/create"
            className="px-5 py-2.5 rounded-full bg-gold-500 text-lumio-dark font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-gold-500/20 hover:scale-105 transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Publier une Nouvelle Œuvre
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-lumio-card border border-lumio-border flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gold-500/10 text-gold-400">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Créations Publiées</p>
              <p className="font-display font-bold text-2xl text-foreground mt-0.5">{stats.totalUploads}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-lumio-card border border-lumio-border flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Likes Reçus</p>
              <p className="font-display font-bold text-2xl text-foreground mt-0.5">{stats.totalLikes}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-lumio-card border border-lumio-border flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Total des Vues</p>
              <p className="font-display font-bold text-2xl text-foreground mt-0.5">{stats.totalViews}</p>
            </div>
          </div>
        </div>

        {/* User's Images */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl text-foreground">
            Mes Créations
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-gold-400 animate-pulse">
              Chargement de votre sanctuaire personnel...
            </div>
          ) : images.length === 0 ? (
            <div className="py-16 text-center space-y-4 rounded-3xl bg-lumio-card/40 border border-lumio-border p-8">
              <Sparkles className="w-8 h-8 text-gold-500 mx-auto" />
              <p className="text-sm font-semibold">Vous n'avez pas encore publié d'images.</p>
              <Link
                href="/create"
                className="inline-block px-5 py-2 rounded-full bg-gold-500 text-lumio-dark font-bold text-xs"
              >
                Publier une création maintenant
              </Link>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((img) => (
                <div key={img.id} className="break-inside-avoid">
                  <ImageCard image={img} queue={images} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Lightbox />
      <VisualEchoModal />

      <Footer />
    </div>
  );
}
