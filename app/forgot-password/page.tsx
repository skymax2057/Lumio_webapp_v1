"use client";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Mail, Sparkles, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailError(null);

    if (!validateEmail(email)) {
      setEmailError("Email invalide");
      setLoading(false);
      return;
    }

    // Simulate password reset email sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-200 flex items-center justify-center mx-auto shadow-lg shadow-gold-500/30"
              >
                <Sparkles className="w-8 h-8 text-lumio-dark" />
              </motion.div>
              <h2 className="font-display font-extrabold text-2xl gold-gradient-text mt-4">
                Réinitialiser le mot de passe
              </h2>
              <p className="text-xs text-muted-foreground">
                Entrez votre email et nous vous enverrons les instructions
              </p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                // Success State
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      Email envoyé !
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Si un compte existe avec l'adresse <strong className="text-gold-400">{email}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-xs text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Retour à la connexion
                    </Link>
                  </div>
                </motion.div>
              ) : (
                // Form State
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gold-500" />
                        Adresse Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError(null);
                        }}
                        placeholder="votre.email@lumio.art"
                        className={`w-full px-4 py-3 rounded-2xl bg-lumio-dark border ${
                          emailError ? "border-rose-500/50" : "border-lumio-border"
                        } text-foreground focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all`}
                      />
                      {emailError && (
                        <p className="text-rose-400 text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {emailError}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 text-lumio-dark font-bold text-xs shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-lumio-dark/30 border-t-lumio-dark rounded-full animate-spin" />
                          Envoi en cours...
                        </span>
                      ) : (
                        "Envoyer les instructions"
                      )}
                    </motion.button>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Retour à la connexion
                    </Link>
                  </div>
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