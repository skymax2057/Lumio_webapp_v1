"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Github, Lock, Mail, Sparkles, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validation
    let hasError = false;
    if (!validateEmail(email)) {
      setEmailError("Email invalide");
      hasError = true;
    }
    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    await signIn(provider, { callbackUrl: "/" });
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
          className="max-w-md w-full space-y-8"
        >
          {/* Main Card */}
          <div className="bg-lumio-card p-8 rounded-3xl border border-lumio-border shadow-2xl backdrop-blur-xl">
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
              <h2 className="font-display font-extrabold text-3xl violet-gradient-text mt-4">
                Bon retour
              </h2>
              <p className="text-xs text-muted-foreground">
                Entrez dans votre "Visual Sanctuary"
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-500" />
                  Adresse Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="elena@lumio.art"
                    className={`w-full pl-4 pr-4 py-3 rounded-2xl bg-lumio-dark border ${
                      emailError ? "border-rose-500/50" : "border-lumio-border"
                    } text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                  />
                </div>
                {emailError && (
                  <p className="text-rose-400 text-[10px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
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
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-4 pr-12 py-3 rounded-2xl bg-lumio-dark border ${
                      passwordError ? "border-rose-500/50" : "border-lumio-border"
                    } text-foreground focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-rose-400 text-[10px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {passwordError}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-lumio-border bg-lumio-dark text-violet-500 focus:ring-violet-500/20 cursor-pointer"
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-violet-500 hover:text-violet-400 transition-colors font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 via-violet-400 to-blue-500 text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lumio-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-lumio-card text-muted-foreground">
                  ou continuer avec
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialSignIn("google")}
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
                onClick={() => handleSocialSignIn("github")}
                className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-lumio-dark border border-lumio-border text-foreground hover:border-violet-500/40 hover:bg-lumio-hover transition-all text-xs font-medium"
              >
                <Github className="w-4 h-4" />
                GitHub
              </motion.button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-[10px] text-violet-500 text-center font-medium mb-1">
                ✨ Comptes démo disponibles
              </p>
              <p className="text-[10px] text-muted-foreground text-center">
                <span className="text-violet-500 font-mono">elena@lumio.art</span> /{" "}
                <span className="text-violet-500 font-mono">password123</span>
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-muted-foreground"
          >
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-violet-500 hover:text-violet-400 font-semibold transition-colors inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              Créer un compte
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}