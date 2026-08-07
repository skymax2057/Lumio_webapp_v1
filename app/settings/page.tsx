"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useSession } from "next-auth/react";
import { useSession as useZustandSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLumioStore } from "@/lib/store";
import {
  User,
  Palette,
  Lock,
  Bell,
  Shield,
  Camera,
  MapPin,
  Globe,
  Heart,
  Sparkles,
  ChevronRight,
  LogOut,
  Trash2,
  Monitor,
  Sun,
  Moon,
  Grid,
  List,
  Sliders,
  Eye,
  EyeOff,
  Save,
  Upload,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

// Interest categories
const interestCategories = [
  { id: "photography", label: "Photographie", icon: "📷" },
  { id: "digital-art", label: "Art Digital", icon: "🎨" },
  { id: "nature", label: "Nature", icon: "🌿" },
  { id: "architecture", label: "Architecture", icon: "🏛️" },
  { id: "abstract", label: "Abstrait", icon: "✨" },
  { id: "minimalism", label: "Minimalisme", icon: "⚪" },
  { id: "portrait", label: "Portrait", icon: "👤" },
  { id: "street", label: "Street Art", icon: "🎭" },
  { id: "fantasy", label: "Fantasy", icon: "🧙" },
  { id: "scifi", label: "Sci-Fi", icon: "🚀" },
  { id: "vintage", label: "Vintage", icon: "📻" },
  { id: "3d", label: "3D Art", icon: "🔮" },
];

// Moods
const moods = [
  { id: "calme", label: "Calme", emoji: "😌" },
  { id: "énergique", label: "Énergique", emoji: "⚡" },
  { id: "mystérieuse", label: "Mystérieuse", emoji: "🌙" },
  { id: "sereine", label: "Sereine", emoji: "🧘" },
  { id: "vibrante", label: "Vibrante", emoji: "🌈" },
  { id: "sombre", label: "Sombre", emoji: "🖤" },
  { id: "romantique", label: "Romantique", emoji: "💕" },
  { id: "épique", label: "Épique", emoji: "🔥" },
];

type Tab = "profile" | "appearance" | "privacy" | "security";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { setSoftGlowEnabled } = useLumioStore();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [occupation, setOccupation] = useState("");
  const [company, setCompany] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Appearance fields
  const [theme, setTheme] = useState("system");
  const [layout, setLayout] = useState("grid");
  const [cardSize, setCardSize] = useState("medium");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [softGlowEnabledState, setSoftGlowEnabledState] = useState(true);

  // Privacy fields
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showLocation, setShowLocation] = useState(true);
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setAvatarPreview(session.user.image || "");
      // Load additional profile data from API
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/user/profile`);
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        if (profile) {
          setBio(profile.bio || "");
          setLocation(profile.location || "");
          setWebsite(profile.website || "");
          setOccupation(profile.occupation || "");
          setCompany(profile.company || "");
          setSelectedInterests(profile.favoriteStyles ? JSON.parse(profile.favoriteStyles) : []);
          setSelectedMoods(profile.favoriteMoods ? JSON.parse(profile.favoriteMoods) : []);
          setTheme(profile.theme || "system");
          setLayout(profile.layout || "grid");
          setCardSize(profile.cardSize || "medium");
          setAnimationsEnabled(profile.animationsEnabled ?? true);
          setSoftGlowEnabledState(profile.softGlowEnabled ?? true);
          setIsProfilePublic(profile.isProfilePublic ?? true);
          setShowEmail(profile.showEmail ?? false);
          setShowLocation(profile.showLocation ?? true);
          setShowStats(profile.showStats ?? true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          location,
          website,
          occupation,
          company,
          favoriteStyles: selectedInterests,
          favoriteMoods: selectedMoods,
          theme,
          layout,
          cardSize,
          animationsEnabled,
          softGlowEnabled: softGlowEnabledState,
          isProfilePublic,
          showEmail,
          showLocation,
          showStats,
        }),
      });

      if (res.ok) {
        setSuccess("Profil mis à jour avec succès !");
        // Sync soft glow preference with global store
        setSoftGlowEnabled(softGlowEnabledState);
        await update();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la mise à jour");
      }
    } catch (e) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setError("Veuillez sélectionner une image");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarPreview(data.avatarUrl);
        setSuccess("Photo de profil mise à jour avec succès !");
        await update();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'upload");
      }
    } catch (e) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
      setAvatarFile(null);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleMood = (id: string) => {
    setSelectedMoods(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (status === "loading") {
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

  const tabs = [
    { id: "profile" as Tab, label: "Profil", icon: User },
    { id: "appearance" as Tab, label: "Apparence", icon: Palette },
    { id: "privacy" as Tab, label: "Confidentialité", icon: Shield },
    { id: "security" as Tab, label: "Sécurité", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-extrabold text-2xl md:text-3xl gold-gradient-text">
            Paramètres
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gérez votre profil et personnalisez votre expérience
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs Navigation */}
          <nav className="md:w-56 flex-shrink-0">
            <div className="bg-lumio-card rounded-2xl border border-lumio-border p-2 space-y-1 sticky top-24">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-violet-500 to-blue-500/20 text-gold-400 border border-amber-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-gold-400" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1">
            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> {success}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-lumio-card rounded-3xl border border-lumio-border p-6 space-y-6 text-xs">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Informations personnelles
                  </h2>
                  <p className="text-muted-foreground">
                    Partagez des détails sur vous avec la communauté
                  </p>
                </div>

                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={avatarPreview || session?.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/30"
                    />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-lumio-dark flex items-center justify-center shadow-lg hover:brightness-110 transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Photo de profil</p>
                    <p className="text-muted-foreground">JPG, PNG ou WebP. Max 5MB</p>
                    {avatarFile && (
                      <button
                        onClick={handleAvatarUpload}
                        disabled={loading}
                        className="mt-2 px-3 py-1 rounded-lg bg-gradient-to-r from-violet-500 to-blue-500 text-lumio-dark text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Upload...' : 'Confirmer'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Nom complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full px-4 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground focus:outline-none focus:border-violet-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Parlez-nous de vous..."
                      rows={3}
                      maxLength={300}
                      className="w-full px-4 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground focus:outline-none focus:border-violet-500 transition-all resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground text-right">
                      {bio.length}/300 caractères
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-violet-500" />
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Paris, France"
                        className="w-full px-4 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-violet-500" />
                        Site web
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://votre-site.com"
                        className="w-full px-4 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Occupation</label>
                      <input
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="Photographe"
                        className="w-full px-4 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Entreprise / École</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Freelance"
                        className="w-full px-4 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground focus:outline-none focus:border-violet-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-3 pt-4 border-t border-lumio-border">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-violet-500" />
                    Centres d'intérêt
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {interestCategories.map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                          selectedInterests.includes(interest.id)
                            ? "bg-gradient-to-r from-violet-500 to-blue-500/20 border-gold-500/50 text-gold-300"
                            : "bg-lumio-dark border-lumio-border text-foreground hover:border-gold-500/40"
                        }`}
                      >
                        <span className="text-lg">{interest.icon}</span>
                        <span className="text-[10px]">{interest.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Moods */}
                <div className="space-y-3 pt-4 border-t border-lumio-border">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-violet-500" />
                    Ambiances préférées
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => toggleMood(mood.id)}
                        className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${
                          selectedMoods.includes(mood.id)
                            ? "bg-gradient-to-r from-violet-500 to-blue-500/20 border-gold-500/50 text-gold-300"
                            : "bg-lumio-dark border-lumio-border text-foreground hover:border-gold-500/40"
                        }`}
                      >
                        <span className="text-lg">{mood.emoji}</span>
                        <span className="text-[10px]">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-lumio-border">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-lumio-dark font-bold text-xs shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-lumio-dark/30 border-t-lumio-dark rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="bg-lumio-card rounded-3xl border border-lumio-border p-6 space-y-6 text-xs">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Apparence
                  </h2>
                  <p className="text-muted-foreground">
                    Personnalisez l'apparence de votre interface
                  </p>
                </div>

                {/* Theme */}
                <div className="space-y-3">
                  <label className="font-semibold text-foreground">Thème</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Clair", icon: Sun },
                      { id: "dark", label: "Sombre", icon: Moon },
                      { id: "system", label: "Système", icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                          theme === option.id
                            ? "bg-gradient-to-r from-violet-500 to-blue-500/20 border-gold-500/50 text-gold-300"
                            : "bg-lumio-dark border-lumio-border text-foreground hover:border-gold-500/40"
                        }`}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div className="space-y-3">
                  <label className="font-semibold text-foreground">Disposition de la galerie</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "grid", label: "Grille", icon: Grid },
                      { id: "list", label: "Liste", icon: List },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setLayout(option.id)}
                        className={`p-4 rounded-2xl border transition-all flex items-center gap-2 ${
                          layout === option.id
                            ? "bg-gradient-to-r from-violet-500 to-blue-500/20 border-gold-500/50 text-gold-300"
                            : "bg-lumio-dark border-lumio-border text-foreground hover:border-gold-500/40"
                        }`}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Size */}
                <div className="space-y-3">
                  <label className="font-semibold text-foreground">Taille des cartes</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "small", label: "Petite" },
                      { id: "medium", label: "Moyenne" },
                      { id: "large", label: "Grande" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setCardSize(option.id)}
                        className={`p-4 rounded-2xl border transition-all text-xs font-medium ${
                          cardSize === option.id
                            ? "bg-gradient-to-r from-violet-500 to-blue-500/20 border-gold-500/50 text-gold-300"
                            : "bg-lumio-dark border-lumio-border text-foreground hover:border-gold-500/40"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-lumio-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Animations</p>
                      <p className="text-muted-foreground">Effets de mouvement et transitions</p>
                    </div>
                    <button
                      onClick={() => setAnimationsEnabled(!animationsEnabled)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        animationsEnabled ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-lumio-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-all ${
                          animationsEnabled ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Soft Glow</p>
                      <p className="text-muted-foreground">Effet de lumière ambiante</p>
                    </div>
                    <button
                      onClick={() => setSoftGlowEnabledState(!softGlowEnabledState)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        softGlowEnabledState ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-lumio-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-all ${
                          softGlowEnabledState ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-lumio-border">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-lumio-dark font-bold text-xs shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-lumio-dark/30 border-t-lumio-dark rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="bg-lumio-card rounded-3xl border border-lumio-border p-6 space-y-6 text-xs">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Confidentialité
                  </h2>
                  <p className="text-muted-foreground">
                    Contrôlez qui peut voir vos informations
                  </p>
                </div>

                {/* Privacy Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Profil public</p>
                      <p className="text-muted-foreground">Votre profil est visible par tous</p>
                    </div>
                    <button
                      onClick={() => setIsProfilePublic(!isProfilePublic)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        isProfilePublic ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-lumio-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-all ${
                          isProfilePublic ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Afficher l'email</p>
                      <p className="text-muted-foreground">Votre email est visible sur votre profil</p>
                    </div>
                    <button
                      onClick={() => setShowEmail(!showEmail)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        showEmail ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-lumio-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-all ${
                          showEmail ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Afficher la localisation</p>
                      <p className="text-muted-foreground">Votre localisation est visible sur votre profil</p>
                    </div>
                    <button
                      onClick={() => setShowLocation(!showLocation)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        showLocation ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-lumio-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-all ${
                          showLocation ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Afficher les statistiques</p>
                      <p className="text-muted-foreground">Vos stats (likes, vues) sont visibles</p>
                    </div>
                    <button
                      onClick={() => setShowStats(!showStats)}
                      className={`w-12 h-6 rounded-full transition-all ${
                        showStats ? "bg-gradient-to-r from-violet-500 to-blue-500" : "bg-lumio-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-all ${
                          showStats ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-lumio-border">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-lumio-dark font-bold text-xs shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-lumio-dark/30 border-t-lumio-dark rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-lumio-card rounded-3xl border border-lumio-border p-6 space-y-6 text-xs">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-lg text-foreground">
                    Sécurité
                  </h2>
                  <p className="text-muted-foreground">
                    Gérez la sécurité de votre compte
                  </p>
                </div>

                {/* Change Password */}
                <div className="p-4 rounded-2xl bg-lumio-dark border border-lumio-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="font-semibold text-foreground">Mot de passe</p>
                      <p className="text-muted-foreground">Changez votre mot de passe régulièrement</p>
                    </div>
                  </div>
                  <Link
                    href="/change-password"
                    className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    Changer le mot de passe <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Sessions */}
                <div className="p-4 rounded-2xl bg-lumio-dark border border-lumio-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Monitor className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="font-semibold text-foreground">Sessions actives</p>
                      <p className="text-muted-foreground">Gérez vos appareils connectés</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    1 session active en ce moment
                  </p>
                  <button className="text-rose-400 hover:text-rose-300 transition-colors text-xs flex items-center gap-1.5">
                    <LogOut className="w-3.5 h-3.5" />
                    Déconnecter les autres sessions
                  </button>
                </div>

                {/* Delete Account */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="w-5 h-5 text-rose-400" />
                    <div>
                      <p className="font-semibold text-rose-400">Supprimer le compte</p>
                      <p className="text-muted-foreground">Action irréversible</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    La suppression de votre compte est définitive. Toutes vos données seront supprimées.
                  </p>
                  <button className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all text-xs font-medium">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}