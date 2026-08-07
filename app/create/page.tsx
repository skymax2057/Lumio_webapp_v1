"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, Image as ImageIcon, Sparkles, UploadCloud, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function CreateImagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !categoryId) setCategoryId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError("Le nom de la catégorie est requis");
      return;
    }

    setCreatingCategory(true);
    setError(null);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
        }),
      });

      if (res.ok) {
        const newCategory = await res.json();
        setCategories([...categories, newCategory]);
        setCategoryId(newCategory.id);
        setNewCategoryName("");
        setNewCategoryDescription("");
        setShowCategoryForm(false);
      } else {
        const err = await res.json();
        setError(err.error || "Erreur lors de la création de la catégorie");
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If category form is open, prevent submission
    if (showCategoryForm) {
      setError("Veuillez d'abord terminer la création de la catégorie ou l'annuler");
      return;
    }

    if (!file || !title) {
      setError("Veuillez sélectionner un fichier image et entrer un titre.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      formData.append("tags", tags);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/image/${created.id}`);
      } else {
        const err = await res.json();
        setError(err.error || "Erreur lors de la publication");
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-violet-500 mx-auto" />
          <h2 className="font-display font-bold text-xl">Connexion requise</h2>
          <p className="text-xs text-muted-foreground">
            Vous devez être connecté pour publier vos créations sur le sanctuaire Lumio.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105"
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

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-lumio-border pb-6">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold-400 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour au Feed
            </Link>
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Lumio Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight gold-gradient-text">
                  Publier une Création
                </h1>
                <p className="text-xs text-muted-foreground">
                  Partagez votre vision dans l'espace "Visual Sanctuary" de Lumio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* File Dropzone / Preview */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative border-2 border-dashed border-lumio-border hover:border-violet-500/60 rounded-3xl p-6 text-center bg-lumio-card/40 transition-all flex flex-col items-center justify-center min-h-[340px] group">
              {previewUrl ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="w-full h-auto max-h-[320px] object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-lumio-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs cursor-pointer shadow-lg">
                      Changer l'image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center space-y-3 w-full h-full justify-center">
                  <div className="p-4 rounded-full bg-amber-500/10 text-violet-400 border border-violet-500/30 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Déposez votre image ici</p>
                    <p className="text-[11px] text-muted-foreground">
                      PNG, JPG, WEBP jusqu'à 20MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Titre de l'œuvre *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Équilibre Lumineux & Clarté"
                className="w-full px-4 py-2.5 rounded-2xl bg-lumio-card border border-lumio-border text-xs text-foreground focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Description / Note de l'artiste
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Partagez l'histoire ou l'intention derrière cette création..."
                className="w-full px-4 py-2.5 rounded-2xl bg-lumio-card border border-lumio-border text-xs text-foreground focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Catégorie
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showCategoryForm ? "Annuler" : "Nouvelle catégorie"}
                </button>
              </div>

              {showCategoryForm ? (
                <div className="p-4 rounded-2xl bg-lumio-dark/50 border border-lumio-border space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Nom de la catégorie *
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ex: Photographie Abstraite"
                      className="w-full px-3 py-2 rounded-xl bg-lumio-card border border-lumio-border text-xs text-foreground focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Description (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      placeholder="Décrivez cette catégorie..."
                      className="w-full px-3 py-2 rounded-xl bg-lumio-card border border-lumio-border text-xs text-foreground focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategoryName.trim()}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creatingCategory ? "Création..." : "Créer & Assigner"}
                  </button>
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-lumio-card border border-lumio-border text-xs text-foreground focus:outline-none focus:border-violet-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="art, nature, minimalisme, or"
                className="w-full px-4 py-2.5 rounded-2xl bg-lumio-card border border-lumio-border text-xs text-foreground focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || creatingCategory || !file || !title}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading || creatingCategory ? "Traitement en cours..." : "Publier l'œuvre sur Lumio"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
