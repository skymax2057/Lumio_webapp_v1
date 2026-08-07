"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Check, Volume2, VolumeX, Lock, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";

interface MicroInteractionsProps {
  children: React.ReactNode;
}

export function MicroInteractionsProvider({ children }: MicroInteractionsProps) {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "like" | "info" | "warning";
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showVolumeMenu, setShowVolumeMenu] = useState(false);
  const { theme } = useTheme();
  const { playSound } = useMicroInteractions();

  // Show notification function
  const showNotification = (message: string, type: "success" | "like" | "info" | "warning" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Keyboard shortcuts for sound
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "m" && e.ctrlKey) {
        setSoundEnabled(!soundEnabled);
        showNotification(
          soundEnabled ? "Sons désactivés" : "Sons activés",
          "info"
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [soundEnabled]);

  // Auto-close volume menu after activation
  useEffect(() => {
    if (soundEnabled && showVolumeMenu) {
      const timer = setTimeout(() => {
        setShowVolumeMenu(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [soundEnabled, showVolumeMenu]);

  // Make showNotification available globally
  useEffect(() => {
    (window as any).showNotification = showNotification;
  }, []);

  return (
    <>
      {children}
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99] backdrop-blur-sm"
              style={{
                backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
              }}
              onClick={() => setNotification(null)}
            />
            
            {/* Notification */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md"
              style={{
                background: notification.type === "like"
                  ? "linear-gradient(135deg, #f43f5e, #ec4899)"
                  : notification.type === "success"
                  ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                  : notification.type === "warning"
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "linear-gradient(135deg, #0f172a, #1e293b)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              {notification.type === "like" && <Heart className="w-5 h-5 fill-white" />}
              {notification.type === "success" && <Check className="w-5 h-5" />}
              {notification.type === "warning" && <Lock className="w-5 h-5" />}
              {notification.type === "info" && <Sparkles className="w-5 h-5" />}
              <span className="text-sm font-medium">{notification.message}</span>
              
              {/* Close button */}
              <button
                onClick={() => setNotification(null)}
                className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sound Toggle Indicator */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          {/* Sound Control Panel */}
          <div className="flex flex-col items-end gap-3">
            {/* Volume Control Slider - Shown when enabled */}
            <AnimatePresence>
              {soundEnabled && showVolumeMenu && (
                <motion.div
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-40 px-4 py-3 rounded-2xl bg-gradient-to-br from-lumio-card/95 to-lumio-card/90 border border-lumio-border/50 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Volume2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="50"
                        className="w-full h-1.5 bg-lumio-border/60 rounded-full appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400 transition-all"
                        onChange={(e) => {
                          // Volume control logic can be added here
                          console.log("Volume:", e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 text-center font-medium tracking-wide">
                    Volume
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sound Status Badge */}
            <AnimatePresence>
              {soundEnabled && showVolumeMenu && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/25 to-blue-500/25 border border-violet-500/40 text-xs font-semibold text-violet-300 backdrop-blur-md shadow-lg shadow-violet-500/10"
                >
                  🔊 Sons activés
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newState = !soundEnabled;
                setSoundEnabled(newState);
                setShowVolumeMenu(newState);
                playSound("notification");
                showNotification(
                  newState ? "🔊 Sons activés" : "🔇 Sons désactivés",
                  "info"
                );
              }}
              className={`p-4 rounded-2xl backdrop-blur-xl border-2 transition-all shadow-2xl ${
                soundEnabled
                  ? "bg-gradient-to-br from-violet-500/25 to-blue-500/25 border-violet-500/50 text-violet-400 hover:from-violet-500/35 hover:to-blue-500/35 hover:shadow-violet-500/25 hover:border-violet-500/60"
                  : "bg-gradient-to-br from-lumio-card/90 to-lumio-card/70 border-lumio-border/50 text-muted-foreground hover:border-gold-500/50 hover:text-foreground hover:shadow-gold-500/15 hover:bg-lumio-card/95"
              }`}
              title={soundEnabled ? "Désactiver les sons (Ctrl+M)" : "Activer les sons (Ctrl+M)"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={soundEnabled ? "on" : "off"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// Hook for using micro-interactions in components
export function useMicroInteractions() {
  const showNotification = (message: string, type: "success" | "like" | "info" | "warning" = "success") => {
    if ((window as any).showNotification) {
      (window as any).showNotification(message, type);
    }
  };

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const playSound = (type: "like" | "success" | "hover" | "notification" = "success") => {
    // Premium iPhone-style notification sounds using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (type === "notification") {
        // iPhone-style "Ding" notification sound
        const playDing = () => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Crystal clear ding with harmonics
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime); // G5
          oscillator.frequency.exponentialRampToValueAtTime(1568, audioContext.currentTime + 0.05); // G6
          oscillator.type = "sine";
          
          // Smooth envelope
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);
          
          // Add harmonic layer for richness
          const oscillator2 = audioContext.createOscillator();
          const gainNode2 = audioContext.createGain();
          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext.destination);
          oscillator2.frequency.setValueAtTime(1047, audioContext.currentTime); // C6
          oscillator2.type = "sine";
          gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode2.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
          gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
          oscillator2.start(audioContext.currentTime);
          oscillator2.stop(audioContext.currentTime + 0.3);
        };
        
        playDing();
        // Double ding for emphasis
        setTimeout(playDing, 150);
        
      } else if (type === "like") {
        // Pleasant "pop" sound for likes
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        
      } else if (type === "success") {
        // Triumphant "chime" sound
        const playChime = (freq: number, delay: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + delay);
          oscillator.type = "sine";
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + delay + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 0.3);
          
          oscillator.start(audioContext.currentTime + delay);
          oscillator.stop(audioContext.currentTime + delay + 0.3);
        };
        
        // Arpeggio chord
        playChime(523.25, 0);    // C5
        playChime(659.25, 0.08); // E5
        playChime(783.99, 0.16); // G5
        playChime(1046.5, 0.24); // C6
        
      } else {
        // Subtle hover sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
      }
    } catch (e) {
      // Audio not supported
    }
  };

  return { showNotification, triggerHapticFeedback, playSound };
}

// Ripple effect component for buttons
export function RippleButton({ 
  children, 
  onClick, 
  className = "",
  variant = "primary" 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onClick?.();
  };

  const baseStyles = "relative overflow-hidden transition-all duration-300";
  const variantStyles = {
    primary: "bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:brightness-110",
    secondary: "bg-lumio-card border border-lumio-border hover:border-gold-500 text-foreground",
    ghost: "bg-transparent hover:bg-lumio-card/50 text-foreground"
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: "20px",
              height: "20px",
              marginLeft: "-10px",
              marginTop: "-10px"
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}
