"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { User, ArrowRight, ArrowLeft, Check, Heart, Palette, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Interest categories
const interestCategories = [
  { id: "photography", label: "Photographie", icon: "📷", color: "from-blue-500 to-cyan-400" },
  { id: "digital-art", label: "Art Digital", icon: "🎨", color: "from-purple-500 to-pink-400" },
  { id: "nature", label: "Nature", icon: "🌿", color: "from-green-500 to-emerald-400" },
  { id: "architecture", label: "Architecture", icon: "🏛️", color: "from-amber-500 to-orange-400" },
  { id: "abstract", label: "Abstrait", icon: "✨", color: "from-rose-500 to-red-400" },
  { id: "minimalism", label: "Minimalisme", icon: "⚪", color: "from-gray-500 to-slate-400" },
  { id: "portrait", label: "Portrait", icon: "👤", color: "from-indigo-500 to-blue-400" },
  { id: "street", label: "Street Art", icon: "🎭", color: "from-yellow-500 to-amber-400" },
  { id: "fantasy", label: "Fantasy", icon: "🧙", color: "from-violet-500 to-purple-400" },
  { id: "scifi", label: "Sci-Fi", icon: "🚀", color: "from-cyan-500 to-blue-400" },
  { id: "vintage", label: "Vintage", icon: "📻", color: "from-amber-600 to-yellow-500" },
  { id: "3d", label: "3D Art", icon: "🔮", color: "from-pink-500 to-rose-400" },
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

type Step = "profile" | "preferences" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const steps: Step[] = ["profile", "preferences", "complete"];
  const currentStepIndex = steps.indexOf(currentStep);

  // If user is already onboarded, redirect to home
  useEffect(() => {
    if (session && (session.user as any)?.isOnboarded) {
      router.push("/");
    }
  }, [session, router]);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          interests: selectedInterests,
          moods: selectedMoods,
        }),
      });

      if (res.ok) {
        // Update the session to reflect the new isOnboarded status
        await update();
        setCurrentStep("complete");
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (e) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case "profile": return "Personnalisez votre profil";
      case "preferences": return "Vos préférences artistiques";
      case "complete": return "Bienvenue sur Lumio !";
    }
  };

  const getStepSubtitle = (step: Step) => {
    switch (step) {
      case "profile": return "Dites-nous en plus sur vous";
      case "preferences": return "Personnalisez votre expérience Lumio";
      case "complete": return "Votre sanctuary visuel vous attend";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full space-y-6"
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    index < currentStepIndex
                      ? "bg-violet-500 text-white"
                      : index === currentStepIndex
                      ? "bg-violet-500/20 border-2 border-violet-500 text-violet-400"
                      : "bg-lumio-dark border border-lumio-border text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 transition-all duration-300 ${
                      index < currentStepIndex ? "bg-violet-500" : "bg-lumio-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Main Card */}
          <div className="bg-lumio-card p-8 rounded-3xl border border-lumio-border shadow-2xl backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {currentStep === "complete" ? (
                // Completion Screen
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 via-violet-500 to-blue-200 flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/30">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display font-extrabold text-3xl violet-gradient-text">
                      Bienvenue sur Lumio !
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Votre profil est maintenant complet. Préparez-vous à explorer un univers visuel unique.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/")}
                      className="px-6 py-3 rounded-2xl bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all"
                    >
                      Explorer Lumio
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/create")}
                      className="px-6 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground hover:border-violet-500/40 transition-all text-xs font-medium"
                    >
                      Publier ma première œuvre
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                // Onboarding Steps
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="text-center space-y-2 mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-20 h-20 flex items-center justify-center mx-auto"
                    >
                      <img src="/logo.png" alt="Lumio Logo" className="w-full h-full object-contain" />
                    </motion.div>
                    <h2 className="font-display font-extrabold text-2xl violet-gradient-text mt-4">
                      {getStepTitle(currentStep)}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {getStepSubtitle(currentStep)}
                    </p>
                    {session?.user?.name && (
                      <p className="text-xs text-violet-400">
                        👋 Ravi de vous accueillir, {session.user.name.split(" ")[0]} !
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-4">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Step Content */}
                  {currentStep === "profile" && (
                    <div className="space-y-6 text-xs">
                      {/* Bio */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-violet-500" />
                          Votre bio <span className="text-muted-foreground font-normal">(optionnel)</span>
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Parlez-nous de vous, de votre art, de vos passions..."
                          rows={4}
                          maxLength={300}
                          className="w-full px-4 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground text-right">
                          {bio.length}/300 caractères
                        </p>
                      </div>
                      {/* Interests */}
                      <div className="space-y-3">
                        <label className="font-semibold text-foreground flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-violet-500" />
                          Vos centres d&apos;intérêt <span className="text-muted-foreground font-normal">(sélectionnez-en plusieurs)</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {interestCategories.map((interest) => (
                            <motion.button
                              key={interest.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => toggleInterest(interest.id)}
                              className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                                selectedInterests.includes(interest.id)
                                  ? `bg-gradient-to-br ${interest.color} border-transparent text-white shadow-lg`
                                  : "bg-lumio-dark border-lumio-border text-foreground hover:border-violet-500/40"
                              }`}
                            >
                              <span className="text-xl">{interest.icon}</span>
                              <span className="text-[10px] font-medium text-center">{interest.label}</span>
                            </motion.button>
                          ))}
                        </div>
                        {selectedInterests.length > 0 && (
                          <p className="text-[10px] text-violet-500 text-center">
                            {selectedInterests.length} centre(s) d&apos;intérêt sélectionné(s)
                          </p>
                        )}
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={nextStep}
                          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-400 to-blue-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                        >
                          Continuer
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {currentStep === "preferences" && (
                    <div className="space-y-6 text-xs">
                      {/* Moods */}
                      <div className="space-y-3">
                        <label className="font-semibold text-foreground flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-violet-500" />
                          Ambiances préférées <span className="text-muted-foreground font-normal">(optionnel)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {moods.map((mood) => (
                            <motion.button
                              key={mood.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => toggleMood(mood.id)}
                              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 ${
                                selectedMoods.includes(mood.id)
                                  ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                                  : "bg-lumio-dark border-lumio-border text-foreground hover:border-violet-500/40"
                              }`}
                            >
                              <span className="text-lg">{mood.emoji}</span>
                              <span className="text-[10px] font-medium">{mood.label}</span>
                            </motion.button>
                          ))}
                        </div>
                        {selectedMoods.length > 0 && (
                          <p className="text-[10px] text-violet-500 text-center">
                            {selectedMoods.length} ambiance(s) sélectionnée(s)
                          </p>
                        )}
                      </div>

                      {/* Info message */}
                      <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                        <p className="text-[10px] text-violet-300">
                          💡 Ces préférences nous aideront à personnaliser votre expérience et à vous recommander des œuvres qui correspondent à vos goûts.
                        </p>
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={prevStep}
                          className="px-6 py-3 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground hover:border-violet-500/40 transition-all text-xs font-medium flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Retour
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmit}
                          disabled={loading}
                          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-400 to-blue-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Terminer et explorer
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
