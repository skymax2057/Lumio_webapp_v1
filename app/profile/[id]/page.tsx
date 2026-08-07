"use client";

import { Footer } from "@/components/footer";
import { FollowButton } from "@/components/follow-button";
import { FollowersModal } from "@/components/followers-modal";
import { ImageCard } from "@/components/image-card";
import { Lightbox } from "@/components/lightbox";
import { Navbar } from "@/components/navbar";
import { VisualEchoModal } from "@/components/visual-echo-modal";
import { ImageItem } from "@/lib/store";
import { Heart, Layers, Sparkles, User as UserIcon, Users, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [userImages, setUserImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">("followers");

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
        setUserImages(data.images);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xs text-violet-400 animate-pulse">
          Chargement du Profil...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Profile Card */}
        <div className="p-8 rounded-3xl bg-lumio-card border border-lumio-border shadow-2xl flex flex-col md:flex-row items-center gap-6">
          <img
            src={
              userProfile.image ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
            }
            alt={userProfile.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-violet-500/50 shadow-xl"
          />

          <div className="space-y-2 text-center md:text-left flex-1">
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-foreground gold-gradient-text">
              {userProfile.name}
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl">
              {userProfile.bio || "Artiste & Créateur passionné sur Lumio Sanctuary."}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4 pt-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-lumio-dark border border-lumio-border text-foreground font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-violet-400" /> {userImages.length} œuvres
              </span>
              <span className="px-3 py-1 rounded-full bg-lumio-dark border border-lumio-border text-foreground font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> {userProfile._count?.likes ?? 0} likes reçus
              </span>
              <button
                onClick={() => { setModalType("followers"); setShowFollowersModal(true); }}
                className="px-3 py-1 rounded-full bg-lumio-dark border border-lumio-border text-foreground font-semibold flex items-center gap-1.5 hover:border-violet-500/50 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" /> {userProfile.followersCount ?? 0} abonnés
              </button>
              <button
                onClick={() => { setModalType("following"); setShowFollowersModal(true); }}
                className="px-3 py-1 rounded-full bg-lumio-dark border border-lumio-border text-foreground font-semibold flex items-center gap-1.5 hover:border-violet-500/50 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-green-400" /> {userProfile.followingCount ?? 0} abonnements
              </button>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
              <FollowButton targetUserId={userId} />
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
            Galerie de {userProfile.name} <Sparkles className="w-4 h-4 text-gold-500" />
          </h2>

          {userImages.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Cet utilisateur n'a pas encore publié d'œuvres publiques.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {userImages.map((img) => (
                <div key={img.id} className="break-inside-avoid">
                  <ImageCard image={img} queue={userImages} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Lightbox />
      <VisualEchoModal />

      <Footer />

      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={userId}
        type={modalType}
      />
    </div>
  );
}
