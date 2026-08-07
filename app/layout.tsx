import { ThemeProvider } from "@/components/theme-provider";
import { ParticlesBackground } from "@/components/particles-background";
import { SoftGlowEffect } from "@/components/soft-glow-effect";
import { ScrollParticles } from "@/components/scroll-particles";
import { MicroInteractionsProvider } from "@/components/micro-interactions";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumio — Visual Sanctuary & Aesthetic Platform",
  description: "Plateforme de partage d'images premium, visuelle et émotionnelle. Masonry grid, Lumina Mood, Collections Intelligentes & Visual Echo.",
  keywords: [
    "images", "photographie", "art", "design", "premium", "gallery",
    "visual", "aesthetic", "masonry", "collections", "mood", "inspiration"
  ],
  authors: [{ name: "Lumio Team" }],
  openGraph: {
    title: "Lumio — Visual Sanctuary & Aesthetic Platform",
    description: "Plateforme de partage d'images premium, visuelle et émotionnelle.",
    type: "website",
    locale: "fr_FR",
    siteName: "Lumio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumio — Visual Sanctuary & Aesthetic Platform",
    description: "Plateforme de partage d'images premium, visuelle et émotionnelle.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="scroll-smooth">
      <body className={`${spaceGrotesk.variable} ${playfairDisplay.variable} font-sans bg-background text-foreground antialiased mesh-gradient min-h-screen`}>
        {/* Animated particles background */}
        <ParticlesBackground
          particleCount={60}
          mouseInteraction={true}
          connectionDistance={120}
        />

        {/* Scroll-reactive golden particles */}
        <ScrollParticles particleCount={40} intensity="medium" />

        {/* Grain texture overlay for premium feel */}
        <div className="grain-overlay fixed inset-0 pointer-events-none z-0" />
        
        <SessionProvider>
          <MicroInteractionsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
            >
              {/* Soft Glow Effect Component */}
              <SoftGlowEffect />
              
              {/* Main content wrapper */}
              <div className="relative z-10">
                {children}
              </div>
            </ThemeProvider>
          </MicroInteractionsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
