"use client";

import { useLumioStore } from "@/lib/store";
import { Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useLumioStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });

      if (res.ok) {
        const created = await res.json();
        setCategories((prev) => [...prev, created]);
        setSelectedCategory(created.slug);
        setNewCatName("");
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

      {/* Form to create new category */}
      {isCreating && (
        <form
          onSubmit={handleCreateCategory}
          className="flex items-center gap-2 bg-card border border-violet-500/20 p-3 rounded-xl"
        >
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nom de la catégorie..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !newCatName.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
          >
            {loading ? "Création..." : "Ajouter"}
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Annuler
          </button>
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
