"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Search } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-indigo-900/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span className="text-sm font-medium text-white/90">
                Visual Sanctuary
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Explorez l'Art
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-blue-300">
                Numérique
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-lg"
            >
              Découvrez une collection d'œuvres visuelles uniques créées par des artistes du monde entier. Laissez-vous inspirer.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Rechercher une œuvre, un artiste..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all"
                />
              </div>
              <button className="px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold hover:from-violet-600 hover:to-blue-600 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center gap-2">
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Rechercher</span>
              </button>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/create"
                className="group px-6 py-3 rounded-xl bg-white text-violet-900 font-semibold hover:bg-violet-50 transition-all shadow-lg shadow-white/20 hover:shadow-white/30 flex items-center gap-2"
              >
                <span>Publier une œuvre</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/collections"
                className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explorer</span>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-8 mt-12 pt-8 border-t border-white/20"
            >
              <div>
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm text-white/60">Œuvres</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5K+</div>
                <div className="text-sm text-white/60">Artistes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-white/60">Collections</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute top-20 right-20 w-32 h-32 rounded-full bg-violet-500/20 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-20 right-40 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl"
      />
    </section>
  );
}
