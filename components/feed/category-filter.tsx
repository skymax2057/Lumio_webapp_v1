"use client";

import { useLumioStore } from "@/lib/store";
import { Plus, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useLumioStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewCatName(val);
    
    // Auto-generate slug
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setNewCatSlug(generatedSlug);
  };

  const generateDescription = async () => {
    if (!newCatName.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewCatDesc(data.description);
      }
    } catch (err) {
      console.error("Failed to generate description", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newCatName.trim(),
          slug: newCatSlug.trim(),
          description: newCatDesc.trim() 
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setCategories((prev) => [...prev, created]);
        setSelectedCategory(created.slug);
        
        // Reset form
        setNewCatName("");
        setNewCatSlug("");
        setNewCatDesc("");
        setIsCreating(false);
      }
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 my-6 bg-card border border-violet-500/20 p-6 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <h3 className="font-semibold text-base text-foreground">
            Catégories
          </h3>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-xl hover:bg-violet-500/10"
        >
          <Plus className="w-3.5 h-3.5" /> Nouvelle
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreateCategory}
          className="bg-card border border-violet-500/30 p-4 rounded-xl space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nom *</label>
              <input
                type="text"
                value={newCatName}
                onChange={handleNameChange}
                placeholder="Ex: Photographie Abstraite"
                className="w-full bg-background border border-border px-4 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500"
                autoFocus
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Limace (Slug)</label>
              <input
                type="text"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                placeholder="photographie-abstraite"
                className="w-full bg-background border border-border px-4 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <button 
                type="button" 
                onClick={generateDescription}
                disabled={generating || !newCatName.trim()}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {generating ? "Génération..." : "Générer avec l'IA"}
              </button>
            </div>
            <textarea
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Description de la catégorie..."
              rows={2}
              className="w-full bg-background border border-border px-4 py-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !newCatName.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              {loading ? "Création..." : "Ajouter la catégorie"}
            </button>
          </div>
        </form>
      )}

      {/* Filter Chips Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 border hover:scale-105 ${selectedCategory === "all"
              ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white border-transparent shadow-lg shadow-violet-500/30"
              : "bg-card border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-400 hover:shadow-md hover:shadow-violet-500/10"
            }`}
        >
          Tout explorer
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 border hover:scale-105 ${selectedCategory === cat.slug
                ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white border-transparent shadow-lg shadow-violet-500/30"
                : "bg-card border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-400 hover:shadow-md hover:shadow-violet-500/10"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
