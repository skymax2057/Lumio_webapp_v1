"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Lightbox } from "@/components/lightbox";
import { VisualEchoModal } from "@/components/visual-echo-modal";
import { useLumioStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  Pencil,
  Share2,
  Sparkles,
  Trash2,
  User,
  Waves
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMicroInteractions } from "@/components/micro-interactions";

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useMicroInteractions();
  const { openVisualEcho, openFocusMode, likedImagesMap, setOptimisticLike } = useLumioStore();

  const imageId = params?.id as string;
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (imageId) fetchImage();
  }, [imageId]);

  const fetchImage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/images/${imageId}`);
      if (res.ok) {
        const data = await res.json();
        setImage(data);
        setEditTitle(data.title);
        setEditDescription(data.description || "");
      } else {
        router.push("/");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session) {
      showNotification("🔐 Connectez-vous pour liker cette œuvre", "warning");
      return;
    }

    if (!image) return;
    const currentLikeState = likedImagesMap[image.id] || {
      liked: false,
      count: image._count?.likes ?? 0,
    };

    const nextLiked = !currentLikeState.liked;
    setOptimisticLike(image.id, nextLiked, nextLiked ? 1 : -1);

    try {
      await fetch(`/api/images/${image.id}/like`, { method: "POST" });
    } catch (err) {
      console.error(err);
      setOptimisticLike(image.id, !nextLiked, nextLiked ? -1 : 1);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette création ?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/images/${imageId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/images/${imageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setImage((prev: any) => ({ ...prev, title: updated.title, description: updated.description }));
        setShowEditModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !image) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 text-xs text-violet-400 animate-pulse">
          Chargement du Sanctuaire Visuel...
        </div>
      </div>
    );
  }

  const isOwner = session?.user?.id === image.userId;
  const currentLike = likedImagesMap[image.id] || {
    liked: false,
    count: image._count?.likes ?? 0,
  };

  const paletteColors: string[] = (() => {
    try {
      return JSON.parse(image.palette);
    } catch {
      return [image.dominantColor, "#D4AF37", "#252530"];
    }
  })();

  const tagsList: string[] = (() => {
    try {
      return JSON.parse(image.tags);
    } catch {
      return ["lumio", "art"];
    }
  })();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au Feed
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Image View */}
          <div className="lg:col-span-8 space-y-4">
            <div
              onClick={() => openFocusMode(image, [image])}
              className="relative rounded-3xl overflow-hidden bg-lumio-card border border-lumio-border cursor-pointer group shadow-2xl hover:scale-102 transition-transform duration-500"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-lumio-dark/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-foreground">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-lumio-dark shadow-xl">
                  Cliquer pour passer en Mode Focus Immersif
                </span>
              </div>
            </div>
          </div>

          {/* Right Details Sidebar */}
          <div className="lg:col-span-4 bg-lumio-card border border-lumio-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center justify-between pb-4 border-b border-lumio-border">
                <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                  Vos Options d'Auteur
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 rounded-full bg-lumio-dark border border-lumio-border text-xs text-muted-foreground hover:text-violet-400 transition-colors"
                    title="Modifier les infos"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500 hover:text-lumio-dark transition-colors"
                    title="Supprimer (Soft Delete)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Category & Title */}
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-blue-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold hover:scale-105 transition-transform">
                {image.category?.name || "Art Visuel"}
              </span>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground gold-gradient-text">
                {image.title}
              </h1>
            </div>

            {/* Author */}
            <div className="p-4 rounded-2xl bg-lumio-dark/60 border border-lumio-border flex items-center gap-3 hover:scale-102 transition-transform">
              <img
                src={
                  image.user.image ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                }
                alt={image.user.name || "Auteur"}
                className="w-10 h-10 rounded-full object-cover border border-violet-500/40"
              />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {image.user.name || "Artiste Lumio"}
                </p>
                <p className="text-[10px] text-muted-foreground">Créateur vérifié</p>
              </div>
            </div>

            {/* Description */}
            {image.description && (
              <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-violet-500/40 pl-3">
                {image.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="p-3 rounded-2xl bg-lumio-dark/40 border border-lumio-border/60 text-center hover:scale-105 transition-transform">
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-violet-400" /> Vues
                </p>
                <p className="font-bold text-sm text-foreground mt-0.5">{image.viewsCount}</p>
              </div>

              <div className="p-3 rounded-2xl bg-lumio-dark/40 border border-lumio-border/60 text-center hover:scale-105 transition-transform">
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 text-violet-400" /> Date
                </p>
                <p className="font-bold text-xs text-foreground mt-0.5">{formatDate(image.createdAt)}</p>
              </div>
            </div>

            {/* Palette & Mood */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Palette Chromatique & Ambiance
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-lumio-dark border border-lumio-border flex-1 hover:scale-105 transition-transform">
                  {paletteColors.map((hex, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-white/20 hover:scale-120 transition-transform"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
                <span className="px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500/10 border border-violet-500/30 text-gold-300 text-xs font-semibold capitalize hover:scale-110 transition-transform">
                  {image.mood}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {tagsList.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-lumio-dark border border-lumio-border text-[10px] text-muted-foreground hover:scale-110 transition-transform"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2 border-t border-lumio-border">
              <button
                onClick={handleLike}
                className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all hover:scale-102 active:scale-98 ${currentLike.liked
                    ? "bg-rose-500/20 border-rose-500 text-rose-400"
                    : "bg-lumio-dark border-lumio-border text-foreground hover:border-violet-500/50"
                  }`}
              >
                <Heart className={`w-4 h-4 ${currentLike.liked ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>Aimer ({currentLike.count})</span>
              </button>

              <button
                onClick={() => openVisualEcho(image)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500/10 border border-violet-500/30 text-gold-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-gradient-to-r from-violet-500 to-blue-500 hover:text-lumio-dark transition-all hover:scale-102 active:scale-98"
              >
                <Waves className="w-4 h-4" /> Explorer le Visual Echo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lumio-dark/80 backdrop-blur-md p-4">
          <div className="bg-lumio-card border border-lumio-border rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-display font-bold text-lg text-foreground">Modifier la Création</h3>
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold">Titre</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-lumio-dark border border-lumio-border text-foreground"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-lumio-dark border border-lumio-border text-foreground"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:scale-105 transition-transform"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-lumio-dark font-bold hover:scale-105 transition-transform"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Lightbox />
      <VisualEchoModal />

      <Footer />
    </div>
  );
}
