"use client"

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Copy, Check, Share2, LayoutGrid, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { getImageUrl, getInitials } from "@/lib/utils";
import { getProjectsAction } from "@/lib/actions/projects";
import type { PostType } from "@/components/feed/FeedCard";
import type { Project } from "@/types";

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  name: string;
  avatarUrl?: string;
  posts: PostType[];
  showOwnProjects: boolean;
}

export default function ShareProfileModal({ isOpen, onClose, username, name, avatarUrl, posts, showOwnProjects }: ShareProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfileUrl(`${window.location.origin}/profile/${encodeURIComponent(username)}`);
    }
  }, [username]);

  useEffect(() => {
    if (isOpen && showOwnProjects) {
      getProjectsAction().then(res => {
        if (res.success) setProjects(res.data || []);
      });
    }
  }, [isOpen, showOwnProjects]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }, [profileUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Perfil de ${name} en Zentry`, url: profileUrl });
      } catch { /* usuario canceló el share nativo */ }
    } else {
      handleCopy();
    }
  }, [name, profileUrl, handleCopy]);

  if (!isOpen || !mounted) return null;

  const qrSrc = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(profileUrl)}`
    : "";

  const modalContent = (
    <AnimatePresence>
      <div onClick={onClose} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-zentry-card border border-zentry-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-4 border-b border-zentry-border flex justify-between items-center bg-zentry-bg">
            <h3 className="font-bold text-lg text-zentry-text-1 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-zentry-accent" /> Compartir Perfil
            </h3>
            <button onClick={onClose} className="text-zentry-text-2 hover:text-zentry-text-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            {/* Tarjeta de identidad */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl border-2 border-zentry-accent/40 bg-zentry-bg flex items-center justify-center text-xl font-black text-zentry-text-1 overflow-hidden relative">
                {avatarUrl ? (
                  <Image src={getImageUrl(avatarUrl)} alt={name} fill sizes="64px" className="object-cover" />
                ) : (
                  getInitials(name)
                )}
              </div>
              <div>
                <p className="font-extrabold text-zentry-text-1">{name}</p>
                <p className="text-xs text-zentry-text-2">@{username}</p>
              </div>
            </div>

            {/* Código QR */}
            {qrSrc && (
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-inner">
                  {/* Servicio externo de solo-lectura para generar el QR de un enlace público */}
                  <img src={qrSrc} alt="Código QR del perfil" width={160} height={160} className="rounded-lg" />
                </div>
              </div>
            )}

            {/* Enlace + acciones */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-zentry-bg border border-zentry-border rounded-xl px-3 py-2.5">
                <span className="flex-1 text-xs text-zentry-text-2 truncate font-mono">{profileUrl}</span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-zentry-card border border-zentry-border text-zentry-text-1 hover:border-zentry-accent transition-colors shrink-0"
                  title="Copiar enlace"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 bg-zentry-accent text-white rounded-xl text-xs font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Compartir enlace
              </button>
            </div>

            {/* Obras creadas */}
            {posts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-zentry-text-2 uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" /> Obras de @{username}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {posts.slice(0, 8).map(post => (
                    <Link
                      key={post.id}
                      href={`/feed?post=${post.id}`}
                      className="aspect-square rounded-xl bg-zentry-bg border border-zentry-border overflow-hidden relative hover:border-zentry-accent transition-colors"
                    >
                      {post.media_type === 'image' && post.media_url ? (
                        <Image src={post.media_url} alt={post.title} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-zentry-text-2 p-1 text-center line-clamp-3">
                          {post.title}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Proyectos (solo si es el propio usuario) */}
            {showOwnProjects && projects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-zentry-text-2 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5" /> Mis Proyectos
                </h4>
                <div className="space-y-1.5">
                  {projects.slice(0, 5).map(project => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between p-2.5 bg-zentry-bg border border-zentry-border rounded-xl hover:border-zentry-accent transition-colors text-xs"
                    >
                      <span className="font-bold text-zentry-text-1 truncate pr-2">{project.title}</span>
                      <span className="text-zentry-text-2 font-mono shrink-0">{project.progress}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
