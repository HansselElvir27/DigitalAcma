"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, ExternalLink, Inbox } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications([]);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-colors group"
      >
        <Bell size={20} className={notifications.length > 0 ? "text-brand-accent animate-pulse" : "opacity-60 group-hover:opacity-100"} />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent rounded-full border-2 border-background"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-96 glass-card border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-sm tracking-tight">Notificaciones</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  <Check size={10} /> Marcar todo como leído
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center opacity-30 flex flex-col items-center gap-3">
                  <Inbox size={32} />
                  <p className="text-sm font-medium">No hay notificaciones nuevas</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-white/5 transition-colors group relative">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-brand-secondary mb-1 uppercase tracking-wider">{n.title}</p>
                          <p className="text-sm opacity-80 leading-relaxed mb-3">{n.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] opacity-30 font-medium">
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                            {n.link && (
                              <Link 
                                href={n.link} 
                                onClick={() => markOneAsRead(n.id)}
                                className="flex items-center gap-1 text-[10px] font-bold text-brand-accent hover:underline uppercase tracking-widest"
                              >
                                Ver Detalle <ExternalLink size={10} />
                              </Link>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => markOneAsRead(n.id)}
                          className="opacity-0 group-hover:opacity-40 hover:opacity-100 p-1"
                          title="Marcar como leído"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
