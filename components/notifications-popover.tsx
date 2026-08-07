"use client";

import { useLumioStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Heart, Layers, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  actor: {
    name: string | null;
    image: string | null;
  };
  image?: {
    id: string;
    title: string;
    url: string;
  } | null;
}

export function NotificationsPopover() {
  const {
    isNotificationOpen,
    setNotificationOpen,
    unreadNotificationsCount,
    setUnreadNotificationsCount,
  } = useLumioStore();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        const unread = (data.notifications || []).filter((n: NotificationItem) => !n.read).length;
        setUnreadNotificationsCount(unread);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 15 seconds for real-time update
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setNotificationOpen(!isNotificationOpen);
          if (!isNotificationOpen) fetchNotifications();
        }}
        className="relative p-2.5 rounded-full bg-lumio-card hover:bg-lumio-hover border border-lumio-border text-muted-foreground hover:text-amber-300 transition-all duration-200"
        title="Centre de notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-black shadow-md shadow-gold-500/50 animate-pulse">
            {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isNotificationOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => setNotificationOpen(false)}
            />

            {/* Notification Popover Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute right-0 mt-3 w-80 sm:w-96 z-50"
            >
              <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-lumio-card via-lumio-card to-violet-500/10 backdrop-blur-xl shadow-2xl shadow-violet-500/20 p-4 text-foreground">
                {/* Decorative gradient effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-lumio-border">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <h3 className="font-display font-semibold text-sm tracking-wide">
                        Notifications Lumio
                      </h3>
                      {unreadNotificationsCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-medium">
                          {unreadNotificationsCount} nouvelles
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="p-1 text-xs text-muted-foreground hover:text-gold-400 flex items-center gap-1 transition-colors"
                          title="Tout marquer comme lu"
                        >
                          <Check className="w-3.5 h-3.5" /> Tout lire
                        </button>
                      )}
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {loading && notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                        Chargement des notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        Aucune notification pour le moment.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border text-xs flex gap-3 transition-colors ${notif.read
                              ? "bg-lumio-dark/40 border-lumio-border/50 text-muted-foreground"
                              : "bg-gold-500/5 border-gold-500/30 text-foreground"
                            }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {notif.type === "LIKE" ? (
                              <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
                                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                              </div>
                            ) : (
                              <div className="p-1.5 rounded-full bg-gold-500/20 text-gold-400">
                                <Layers className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-1">
                            <p className="leading-snug">{notif.message}</p>
                            <span className="text-[10px] text-muted-foreground block">
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>

                          {notif.image && (
                            <Link
                              href={`/image/${notif.image.id}`}
                              onClick={() => setNotificationOpen(false)}
                              className="shrink-0 group"
                            >
                              <img
                                src={notif.image.url}
                                alt={notif.image.title}
                                className="w-10 h-10 rounded-lg object-cover border border-lumio-border group-hover:scale-105 transition-transform"
                              />
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
