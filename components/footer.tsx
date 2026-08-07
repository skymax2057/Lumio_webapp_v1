"use client";

import { Heart, ArrowUpRight, Mail, Github, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-violet-500/10 bg-background/50 backdrop-blur-sm py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent tracking-tight">
                Lumio
              </h3>
              <p className="text-sm text-muted-foreground">
                Visual Sanctuary
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-md">
              Une plateforme premium dédiée à la photographie, l'art numérique et la création épurée.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all hover:scale-105">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all hover:scale-105">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all hover:scale-105">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="font-display font-medium text-foreground text-sm tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-violet-500/30 group-hover:bg-violet-500 transition-colors" />
                  Feed Principal
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-violet-500/30 group-hover:bg-violet-500 transition-colors" />
                  Collections
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-violet-500/30 group-hover:bg-violet-500 transition-colors" />
                  Publier
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-violet-500/30 group-hover:bg-violet-500 transition-colors" />
                  Dashboard
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-display font-medium text-foreground text-sm tracking-wide">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@lumio.app" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                  <Mail className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                  hello@lumio.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-violet-500/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span>©</span>
              <span>{new Date().getFullYear()}</span>
              <span>Lumio</span>
              <span>—</span>
              <span>Tous droits réservés</span>
            </p>
            <p className="flex items-center gap-2">
              <span>Fait avec</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>pour les passionnés du beau</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
