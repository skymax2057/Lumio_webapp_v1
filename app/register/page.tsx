"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Lock, Mail, Sparkles, User, ArrowRight, ArrowLeft, Check, AlertCircle, Eye, EyeOff, Camera, Heart, Palette, Globe, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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

type Step = "account" | "profile" | "preferences" | "complete";

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const steps: Step[] = ["account", "profile", "preferences", "complete"];
  const currentStepIndex = steps.indexOf(currentStep);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return { label: "Faible", color: "bg-rose-500" };
    if (passwordStrength <= 4) return { label: "Moyen", color: "bg-yellow-500" };
    return { label: "Fort", color: "bg-emerald-500" };
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === "account") {
      if (!name.trim()) newErrors.name = "Le nom est requis";
      if (!email.trim()) newErrors.email = "L'email est requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email invalide";
      if (!password) newErrors.password = "Le mot de passe est requis";
      else if (password.length < 6) newErrors.password = "6 caractères minimum";
      if (password !== confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      if (!agreeTerms) newErrors.agreeTerms = "Vous devez accepter les conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex]);
      }
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
    if (!validateStep("account")) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          bio,
          interests: selectedInterests,
          moods: selectedMoods,
        }),
      });

      if (res.ok) {
        // Auto login after registration
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signInResult?.error) {
          setCurrentStep("complete");
        } else {
          router.push("/login");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch (e) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case "account": return "Créer votre compte";
      case "profile": return "Personnalisez votre profil";
      case "preferences": return "Vos préférences artistiques";
      case "complete": return "Bienvenue sur Lumio !";
    }
  };

  const getStepSubtitle = (step: Step) => {
    switch (step) {
      case "account": return "Rejoignez la communauté des artistes et esthètes";
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
                      Votre compte a été créé avec succès. Préparez-vous à explorer un univers visuel unique.
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
                // Registration Steps
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
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Step Content */}
                  {currentStep === "account" && (
                    <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                      {/* Social Sign Up */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground hover:border-violet-500/40 hover:bg-lumio-hover transition-all text-xs font-medium"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground hover:border-violet-500/40 hover:bg-lumio-hover transition-all text-xs font-medium"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </motion.button>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-lumio-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-4 bg-lumio-card text-muted-foreground">
                            ou créer avec un email
                          </span>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-violet-500" />
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: "" });
                          }}
                          placeholder="Elena Rostova"
                          className={`w-full px-4 py-3 rounded-2xl bg-lumio-dark border ${
                            errors.name ? "border-rose-500/50" : "border-lumio-border"
                          } text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                        />
                        {errors.name && (
                          <p className="text-rose-400 text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-violet-500" />
                          Adresse Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: "" });
                          }}
                          placeholder="votre.nom@lumio.art"
                          className={`w-full px-4 py-3 rounded-2xl bg-lumio-dark border ${
                            errors.email ? "border-rose-500/50" : "border-lumio-border"
                          } text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                        />
                        {errors.email && (
                          <p className="text-rose-400 text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-violet-500" />
                          Mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password) setErrors({ ...errors, password: "" });
                            }}
                            placeholder="••••••••"
                            className={`w-full pl-4 pr-12 py-3 rounded-2xl bg-lumio-dark border ${
                              errors.password ? "border-rose-500/50" : "border-lumio-border"
                            } text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {/* Password Strength */}
                        {password && (
                          <div className="space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded-full transition-all ${
                                    level <= passwordStrength
                                      ? getStrengthLabel().color
                                      : "bg-lumio-border"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Force: <span className={getStrengthLabel().color.replace("bg-", "text-")}>{getStrengthLabel().label}</span>
                            </p>
                          </div>
                        )}
                        {errors.password && (
                          <p className="text-rose-400 text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Confirmer le mot de passe</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                          }}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 rounded-2xl bg-lumio-dark border ${
                            errors.confirmPassword ? "border-rose-500/50" : "border-lumio-border"
                          } text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                        />
                        {errors.confirmPassword && (
                          <p className="text-rose-400 text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-2 pt-2">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: "" });
                          }}
                          className="w-4 h-4 rounded border-lumio-border bg-lumio-dark text-violet-500 focus:ring-violet-500/20 cursor-pointer mt-0.5"
                        />
                        <label className="text-[10px] text-muted-foreground cursor-pointer">
                          J'accepte les{" "}
                          <Link href="/terms" className="text-violet-500 hover:underline">
                            Conditions d'utilisation
                          </Link>{" "}
                          et la{" "}
                          <Link href="/privacy" className="text-violet-500 hover:underline">
                            Politique de confidentialité
                          </Link>
                        </label>
                      </div>
                      {errors.agreeTerms && (
                        <p className="text-rose-400 text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.agreeTerms}
                        </p>
                      )}

                      {/* Next Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-400 to-blue-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        Continuer
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </form>
                  )}

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
                          Vos centres d'intérêt <span className="text-muted-foreground font-normal">(sélectionnez-en plusieurs)</span>
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
                            {selectedInterests.length} centre(s) d'intérêt sélectionné(s)
                          </p>
                        )}
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
                              Création du compte...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Rejoindre Lumio
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

          {/* Login Link */}
          {currentStep !== "complete" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-muted-foreground"
            >
              Déjà inscrit ?{" "}
              <Link
                href="/login"
                className="text-violet-500 hover:text-violet-400 font-semibold transition-colors inline-flex items-center gap-1 hover:gap-2 transition-all"
              >
                Se connecter
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}