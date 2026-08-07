"use client";

import { Sparkles, Crown, Gem, Type, Divide, Grid3X3 } from "lucide-react";

/**
 * GlassEffectsShowcase - A demonstration component showcasing all sophisticated glassmorphism effects
 * 
 * This component displays the various advanced glass effects available:
 * - Diagonal light reflections with gradients
 * - Golden gradient borders (subtle, enhanced, animated)
 * - Colored shadows (gold, rose, luxury combinations)
 * - Depth effects with inner shadows
 * - Premium typography with golden text effects
 */
export function GlassEffectsShowcase() {
  return (
    <div className="space-y-8 p-8">
      <div className="text-center space-y-2">
        <h2 className="title-premium-gradient text-3xl">
          Effets de Verre Sophistiqués
        </h2>
        <p className="luxury-tracking text-muted-foreground">
          Glassmorphism avancé avec reflets lumineux et bordures dorées
        </p>
      </div>

      {/* Diagonal Light Reflections */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-400" />
          Reflets Lumineux Diagonaux
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Diagonal Shine */}
          <div className="card-diagonal-shine premium-card rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Card Diagonal Shine</h4>
            <p className="text-sm text-muted-foreground">
              Reflets diagonaux subtils avec animation
            </p>
          </div>

          {/* Card Multi Shine */}
          <div className="card-multi-shine premium-card rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Card Multi Shine</h4>
            <p className="text-sm text-muted-foreground">
              Multiples couches de reflets lumineux
            </p>
          </div>

          {/* Glass Reflection */}
          <div className="glass-reflection premium-card rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Glass Reflection</h4>
            <p className="text-sm text-muted-foreground">
              Reflet de verre classique avec animation
            </p>
          </div>
        </div>
      </div>

      {/* Golden Gradient Borders */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Crown className="w-5 h-5 text-gold-400" />
          Bordures avec Dégradés Dorés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Subtle Gold Border */}
          <div className="gold-border-subtle rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Subtil</h4>
            <p className="text-sm text-muted-foreground">
              Bordure dorée subtile pour éléments réguliers
            </p>
          </div>

          {/* Premium Gold Border */}
          <div className="premium-gold-border rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Premium</h4>
            <p className="text-sm text-muted-foreground">
              Bordure dorée animée premium
            </p>
          </div>

          {/* Enhanced Premium Gold Border */}
          <div className="premium-gold-border-enhanced rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Enhanced</h4>
            <p className="text-sm text-muted-foreground">
              Bordure dorée améliorée avec multiples couches
            </p>
          </div>

          {/* Animated Gold Border */}
          <div className="gold-border-animated rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Animated</h4>
            <p className="text-sm text-muted-foreground">
              Bordure dorée avec animation conique
            </p>
          </div>
        </div>
      </div>

      {/* Colored Shadows */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Gem className="w-5 h-5 text-gold-400" />
          Effets de Profondeur avec Ombres Colorées
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gold Shadows */}
          <div className="space-y-4">
            <div className="shadow-gold premium-card rounded-2xl p-4">
              <p className="text-sm text-violet-300">Shadow Gold</p>
            </div>
            <div className="shadow-gold-gradient premium-card rounded-2xl p-4">
              <p className="text-sm text-violet-300">Shadow Gold Gradient</p>
            </div>
            <div className="shadow-glow-gold premium-card rounded-2xl p-4">
              <p className="text-sm text-violet-300">Shadow Glow Gold</p>
            </div>
          </div>

          {/* Rose Shadows */}
          <div className="space-y-4">
            <div className="shadow-rose premium-card rounded-2xl p-4">
              <p className="text-sm text-rose-300">Shadow Rose</p>
            </div>
            <div className="shadow-rose-gradient premium-card rounded-2xl p-4">
              <p className="text-sm text-rose-300">Shadow Rose Gradient</p>
            </div>
            <div className="shadow-glow-rose premium-card rounded-2xl p-4">
              <p className="text-sm text-rose-300">Shadow Glow Rose</p>
            </div>
          </div>

          {/* Luxury Shadows */}
          <div className="space-y-4">
            <div className="shadow-luxury premium-card rounded-2xl p-4">
              <p className="text-sm text-violet-300">Shadow Luxury</p>
            </div>
            <div className="shadow-luxury-advanced premium-card rounded-2xl p-4">
              <p className="text-sm text-violet-300">Shadow Luxury Advanced</p>
            </div>
            <div className="shadow-float-gold premium-card rounded-2xl p-4">
              <p className="text-sm text-violet-300">Shadow Float Gold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Typography */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Type className="w-5 h-5 text-gold-400" />
          Typographie Premium
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Golden Text Effects */}
          <div className="premium-card rounded-2xl p-6 space-y-4">
            <h4 className="font-semibold text-violet-300 mb-4">Effets de Texte Doré</h4>
            
            <div className="space-y-3">
              <p className="text-gold-subtle">Texte doré subtil</p>
              <p className="text-gold-medium">Texte doré moyen</p>
              <p className="text-gold-intense">Texte doré intense</p>
              <p className="gold-glow-text">Texte avec lueur dorée</p>
              <p className="gold-glow-text-strong">Texte avec lueur dorée forte</p>
            </div>
          </div>

          {/* Gradient Text Effects */}
          <div className="premium-card rounded-2xl p-6 space-y-4">
            <h4 className="font-semibold text-violet-300 mb-4">Effets de Dégradé</h4>
            
            <div className="space-y-3">
              <p className="text-gold-gradient">Texte dégradé doré</p>
              <p className="text-gold-gradient-animated">Texte dégradé animé</p>
              <p className="text-metallic-gold">Texte métallique doré</p>
              <p className="text-rose-gold">Texte rose gold</p>
              <p className="text-underline-gold">Texte avec soulignement doré</p>
            </div>
          </div>
        </div>

        {/* Shimmer Effects */}
        <div className="premium-card rounded-2xl p-6">
          <h4 className="font-semibold text-violet-300 mb-4">Effets de Shimmer</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <p className="shimmer-subtle text-lg font-semibold">Shimmer Subtil</p>
            </div>
            <div className="text-center p-4">
              <p className="shimmer-luxury text-lg font-semibold">Shimmer Luxe</p>
            </div>
            <div className="text-center p-4">
              <p className="shimmer-intense text-lg font-semibold">Shimmer Intense</p>
            </div>
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="premium-card rounded-2xl p-6">
          <h4 className="font-semibold text-violet-300 mb-4">Espacement de Lettres (Letter Spacing)</h4>
          
          <div className="space-y-3">
            <p className="luxury-tracking-tight text-violet-300">Espacement serré (0.05em)</p>
            <p className="luxury-tracking text-violet-300">Espacement standard (0.15em)</p>
            <p className="luxury-tracking-wide text-violet-300">Espacement large (0.25em)</p>
            <p className="luxury-tracking-wider text-violet-300">Espacement très large (0.35em)</p>
            <p className="luxury-tracking-extrawide text-violet-300">Espacement extra large (0.5em)</p>
          </div>
        </div>

        {/* Premium Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="premium-card rounded-2xl p-8 text-center">
            <h2 className="title-premium text-2xl mb-2">Titre Premium</h2>
            <p className="subtitle-luxury">Sous-titre de luxe</p>
          </div>
          
          <div className="premium-card rounded-2xl p-8 text-center">
            <h2 className="title-premium-gradient text-2xl mb-2">Titre Premium Dégradé</h2>
            <p className="subtitle-luxury">Sous-titre de luxe</p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Divide className="w-5 h-5 text-gold-400" />
          Éléments Décoratifs Raffinés
        </h3>
        
        {/* Golden Dividers */}
        <div className="premium-card rounded-2xl p-6">
          <h4 className="font-semibold text-violet-300 mb-4">Lignes Dorées comme Séparateurs</h4>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Divider Gold Standard</p>
              <div className="divider-gold"></div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Divider Gold Thin</p>
              <div className="divider-gold-thin"></div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Divider Gold Fancy</p>
              <div className="divider-gold-fancy"></div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Divider Gold Animated</p>
              <div className="divider-gold-animated"></div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Divider Rose</p>
              <div className="divider-rose"></div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Divider Luxury</p>
              <div className="divider-luxury"></div>
            </div>
          </div>
        </div>

        {/* Geometric Patterns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="premium-card rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-4">Patterns Géométriques</h4>
            
            <div className="space-y-4">
              <div className="pattern-dots p-4 rounded-lg border border-violet-500/20">
                <p className="text-xs text-muted-foreground">Pattern Dots</p>
              </div>
              
              <div className="pattern-grid p-4 rounded-lg border border-violet-500/20">
                <p className="text-xs text-muted-foreground">Pattern Grid</p>
              </div>
              
              <div className="pattern-diagonal p-4 rounded-lg border border-violet-500/20">
                <p className="text-xs text-muted-foreground">Pattern Diagonal</p>
              </div>
              
              <div className="pattern-hexagon p-4 rounded-lg border border-violet-500/20">
                <p className="text-xs text-muted-foreground">Pattern Hexagon</p>
              </div>
              
              <div className="pattern-diamonds p-4 rounded-lg border border-violet-500/20">
                <p className="text-xs text-muted-foreground">Pattern Diamonds</p>
              </div>
              
              <div className="pattern-animated-dots p-4 rounded-lg border border-violet-500/20">
                <p className="text-xs text-muted-foreground">Pattern Animated Dots</p>
              </div>
            </div>
          </div>

          {/* Shine Effects on Images */}
          <div className="premium-card rounded-2xl p-6 md:col-span-2">
            <h4 className="font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Effets de Brillance sur Images
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="image-shine-effect rounded-lg overflow-hidden bg-gradient-to-br from-lumio-card to-lumio-border aspect-square flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Shine Effect</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">Standard</p>
              </div>
              
              <div className="space-y-2">
                <div className="image-shine-gold rounded-lg overflow-hidden bg-gradient-to-br from-lumio-card to-lumio-border aspect-square flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Shine Gold</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">Gold</p>
              </div>
              
              <div className="space-y-2">
                <div className="image-shine-rose rounded-lg overflow-hidden bg-gradient-to-br from-lumio-card to-lumio-border aspect-square flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Shine Rose</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">Rose</p>
              </div>
              
              <div className="space-y-2">
                <div className="image-shine-luxury rounded-lg overflow-hidden bg-gradient-to-br from-lumio-card to-lumio-border aspect-square flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Shine Luxury</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">Luxury</p>
              </div>
              
              <div className="space-y-2">
                <div className="image-shine-radial rounded-lg overflow-hidden bg-gradient-to-br from-lumio-card to-lumio-border aspect-square flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Shine Radial</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">Radial</p>
              </div>
              
              <div className="space-y-2">
                <div className="image-shine-pulse rounded-lg overflow-hidden bg-gradient-to-br from-lumio-card to-lumio-border aspect-square flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Shine Pulse</span>
                </div>
                <p className="text-xs text-center text-muted-foreground">Pulse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="corner-decoration premium-card rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Corner Decoration</h4>
            <p className="text-sm text-muted-foreground">
              Coins décoratifs subtils avec bordures dorées
            </p>
          </div>
          
          <div className="corner-decoration-gold premium-card rounded-2xl p-6">
            <h4 className="font-semibold text-violet-300 mb-2">Corner Decoration Gold</h4>
            <p className="text-sm text-muted-foreground">
              Coins décoratifs premium avec bordures dorées épaisses
            </p>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="floating-particles premium-card rounded-2xl p-6">
          <h4 className="font-semibold text-violet-300 mb-2">Floating Particles</h4>
          <p className="text-sm text-muted-foreground">
            Particules dorées flottantes en arrière-plan avec animation
          </p>
        </div>

        {/* Border Beam */}
        <div className="border-beam premium-card rounded-2xl p-6">
          <h4 className="font-semibold text-violet-300 mb-2">Border Beam Effect</h4>
          <p className="text-sm text-muted-foreground">
            Effet de faisceau rotatif sur les bordures
          </p>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Exemples d'Utilisation
        </h3>
        
        <div className="premium-card rounded-2xl p-6">
          <h4 className="font-semibold text-violet-300 mb-4">Exemple Complet avec Éléments Décoratifs</h4>
          
          <div className="space-y-6">
            <div className="corner-decoration-gold premium-card rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Section avec coins décoratifs dorés
              </p>
            </div>
            
            {/* <GoldenDivider variant="gold-fancy" /> */}
            
            <div className="pattern-dots premium-card rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Section avec pattern de points en arrière-plan
              </p>
            </div>
            
            {/* <GoldenDivider variant="gold-animated" /> */}
            
            <div className="border-beam premium-card rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Section avec effet de faisceau sur la bordure
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Effets Combinés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ultimate Premium Card */}
          <div className="card-diagonal-shine premium-gold-border-enhanced shadow-luxury-advanced-intense premium-card rounded-2xl p-8">
            <h4 className="title-premium text-xl mb-3">
              Carte Premium Ultime
            </h4>
            <p className="text-muted-foreground mb-4">
              Combinaison de tous les effets: reflets diagonaux, bordure dorée améliorée, et ombres de luxe avancées.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs luxury-tracking">
                Reflets
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs luxury-tracking">
                Doré
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs luxury-tracking">
                Profondeur
              </span>
            </div>
          </div>

          {/* Rose Gold Luxury Card */}
          <div className="card-multi-shine premium-gold-border shadow-luxury-advanced premium-card rounded-2xl p-8">
            <h4 className="font-display font-bold text-xl text-rose-gold mb-3">
              Carte Rose Gold
            </h4>
            <p className="text-muted-foreground mb-4">
              Effets multi-reflets avec bordure dorée et ombres rose gold luxueuses.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs luxury-tracking">
                Multi-Reflets
              </span>
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs luxury-tracking">
                Doré
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs luxury-tracking">
                Rose Gold
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
