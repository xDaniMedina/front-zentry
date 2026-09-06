"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User as UserIcon } from "lucide-react"
import useSWR from "swr"
import Image from "next/image"
import Link from "next/link"
import { getFollowersAction, getFollowingAction } from "@/lib/actions/friends"
import { getInitials, getImageUrl } from "@/lib/utils"

interface FollowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  type: 'followers' | 'following';
}

export default function FollowsModal({ isOpen, onClose, username, type }: FollowsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset" };
  }, [isOpen]);

  const { data, isLoading } = useSWR(
    isOpen ? `follows-${type}-${username}` : null,
    async () => {
      if (type === 'followers') return await getFollowersAction(username);
      return await getFollowingAction(username);
    }
  );

  const usersList = data?.data || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm sm:max-w-md h-[80vh] sm:h-[600px] bg-zentry-bg border border-zentry-border sm:rounded-3xl z-[101] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zentry-border shrink-0">
              <h2 className="text-lg font-black text-zentry-text-1">
                {type === 'followers' ? 'Seguidores' : 'Siguiendo'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zentry-card text-zentry-text-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-zentry-text-2 space-y-3">
                  <div className="w-8 h-8 border-2 border-zentry-accent border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold">Cargando perfiles...</p>
                </div>
              ) : usersList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zentry-text-2 space-y-3 opacity-60">
                  <UserIcon className="w-12 h-12" />
                  <p className="text-sm font-bold">
                    {type === 'followers' ? 'No tiene seguidores aún.' : 'No sigue a nadie aún.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {usersList.map((u: any, i: number) => (
                    <Link 
                      key={u.id || i}
                      href={`/profile/${u.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zentry-card transition-colors group cursor-pointer"
                    >
                      <div className="relative w-12 h-12 rounded-full bg-zentry-card border border-zentry-border flex items-center justify-center overflow-hidden shrink-0">
                        {u.avatar_url ? (
                          <Image src={getImageUrl(u.avatar_url)} alt={u.username} fill className="object-cover" />
                        ) : (
                          <span className="text-sm font-black text-zentry-text-2">{getInitials(u.name || u.username)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-zentry-text-1 truncate group-hover:text-zentry-accent transition-colors">
                          {u.name || u.username}
                        </p>
                        <p className="text-xs text-zentry-text-2 truncate">@{u.username}</p>
                      </div>
                      {/* Placeholder for follow button if needed in future */}
                      <div className="px-4 py-1.5 bg-zentry-card border border-zentry-border rounded-xl text-xs font-bold text-zentry-text-1 hover:border-zentry-accent transition-colors">
                        Ver
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
