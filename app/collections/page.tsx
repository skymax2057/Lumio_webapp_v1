"use client";

import { Footer } from "@/components/footer";
import { ImageCard } from "@/components/image-card";
import { Navbar } from "@/components/navbar";
import { ImageItem, useLumioStore } from "@/lib/store";
import { FolderHeart, Layers, Plus, Sparkles, Wand2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Collection {
  id: string;
  title: string;
  description?: string | null;
  isPrivate: boolean;
  user: {
    name?: string | null;
  };
  images: Array<{
    image: {
      url: string;
    };
  }>;
  _count: {
    images: number;
  };
}

export default function CollectionsPage() {
  const { data: session } = useSession();
  const { mixedCollectionIds, toggleMixedCollection, clearMixedCollections } = useLumioStore();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [mixedImages, setMixedImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mixing, setMixing] = useState(false);

  // New Collection Form
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (mixedCollectionIds.length > 0) {
      fetchMixedFeed();
    } else {
      setMixedImages([]);
    }
  }, [mixedCollectionIds]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMixedFeed = async () => {
    setMixing(true);
    try {
      const res = await fetch("/api/collections/mix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionIds: mixedCollectionIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setMixedImages(data.images);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMixing(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, isPrivate }),
      });

      if (res.ok) {
        setShowCreate(false);
        setTitle("");
        setDescription("");
        fetchCollections();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lumio-border pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold">
              <FolderHeart className="w-3.5 h-3.5" /> Collections Intelligentes
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              Boards & Collection Mixer
            </h1>
            <p className="text-xs text-muted-foreground">
              Fusionnez plusieurs univers créatifs en temps réel avec le Collection Mixer.
            </p>
          </div>

          {session?.user && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 rounded-full bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-violet-500/20 hover:scale-105 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Créer un Board
            </button>
          )}
        </div>

        {/* Create Collection Modal */}
        {showCreate && (
          <div className="p-6 rounded-3xl bg-lumio-card border border-violet-500/40 space-y-4 max-w-lg">
            <h3 className="font-display font-bold text-sm text-foreground">Nouveau Board Privé / Public</h3>
            <form onSubmit={handleCreateCollection} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Titre de la collection (ex: Minimalisme Japonais)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-lumio-dark border border-lumio-border text-foreground"
              />
              <textarea
                placeholder="Description du board..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-lumio-dark border border-lumio-border text-foreground"
              />
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Collection privée (visible uniquement par vous)
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 text-muted-foreground"
                >
                  Annuler
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-violet-500 text-white font-bold">
                  Créer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collection Mixer Control Bar */}
        {mixedCollectionIds.length > 0 && (
          <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/40 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <Wand2 className="w-5 h-5 text-violet-400 animate-spin" style={{ animationDuration: "8s" }} />
              <div>
                <p className="text-xs font-bold text-violet-300">
                  Collection Mixer Actif ({mixedCollectionIds.length} collections fusionnées)
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Stream d'images combiné sans doublons.
                </p>
              </div>
            </div>

            <button
              onClick={clearMixedCollections}
              className="px-3 py-1.5 rounded-full bg-lumio-dark border border-lumio-border text-xs text-muted-foreground hover:text-foreground"
            >
              Réinitialiser le Mixer
            </button>
          </div>
        )}

        {/* Collections Grid Selectors */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Sélectionnez les boards à mixer :
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => {
              const isSelected = mixedCollectionIds.includes(col.id);
              const previewThumbnails = col.images.map((img) => img.image.url);

              return (
                <div
                  key={col.id}
                  onClick={() => toggleMixedCollection(col.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-4 ${isSelected
                      ? "bg-violet-500/10 border-violet-500 shadow-xl shadow-violet-500/10"
                      : "bg-lumio-card border-lumio-border hover:border-violet-500/40"
                    }`}
                >
                  {/* Thumbnail collage */}
                  <div className="grid grid-cols-2 gap-2 h-36 rounded-2xl overflow-hidden bg-lumio-dark/50">
                    {previewThumbnails.slice(0, 4).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    ))}
                    {previewThumbnails.length === 0 && (
                      <div className="col-span-2 flex items-center justify-center text-xs text-muted-foreground">
                        Collection vide
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-base text-foreground">
                        {col.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {col.description || `Par ${col.user.name || "Créateur"}`}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${isSelected
                          ? "bg-violet-500 text-white"
                          : "bg-lumio-dark border border-lumio-border text-muted-foreground"
                        }`}
                    >
                      {isSelected ? "Mixé ✓" : `${col._count.images} œuvres`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fused Feed View */}
        {mixedCollectionIds.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-lumio-border">
            <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
              Résultat de la Fusion <Sparkles className="w-5 h-5 text-gold-500" />
            </h2>

            {mixing ? (
              <div className="py-12 text-center text-xs text-violet-400 animate-pulse">
                Fusion des collections en cours...
              </div>
            ) : mixedImages.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Aucune image dans les collections sélectionnées.
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {mixedImages.map((img) => (
                  <div key={img.id} className="break-inside-avoid">
                    <ImageCard image={img} queue={mixedImages} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
