"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  UserPlus, Users, Send, Search, Check, X, MessageSquare,
  UserMinus, Loader2
} from "lucide-react";
import { FriendUser } from "@/types";
import { getImageUrl, getInitials } from "@/lib/utils";
import {
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  sendFriendRequestAction,
  removeFriendAction,
} from "@/lib/actions/friends";
import { searchExplore, UserDTO } from "@/lib/actions/explore";

type Tab = 'requests' | 'sent' | 'suggestions' | 'friends';

interface FriendsClientProps {
  initialFriends: FriendUser[];
  initialPending: FriendUser[];
  initialSent: FriendUser[];
  initialSuggestions: FriendUser[];
}

export default function FriendsClient({ initialFriends, initialPending, initialSent, initialSuggestions }: FriendsClientProps) {
  const [tab, setTab] = useState<Tab>('requests');
  const [friends, setFriends] = useState(initialFriends);
  const [pending, setPending] = useState(initialPending);
  const [sent, setSent] = useState(initialSent);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserDTO[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const setBusy = (key: string, busy: boolean) => {
    setBusyIds(prev => {
      const next = new Set(prev);
      if (busy) next.add(key); else next.delete(key);
      return next;
    });
  };

  const handleAccept = async (req: FriendUser) => {
    const key = `accept-${req.request_id}`;
    setBusy(key, true);
    const res = await acceptFriendRequestAction(Number(req.request_id));
    setBusy(key, false);
    if (res.success) {
      setPending(prev => prev.filter(r => r.request_id !== req.request_id));
      setFriends(prev => [req, ...prev]);
      toast.success(res.message || `¡Ahora eres amigo de ${req.name}!`);
    } else {
      toast.error("No se pudo aceptar la solicitud");
    }
  };

  const handleReject = async (req: FriendUser, fromTab: 'requests' | 'sent') => {
    const key = `reject-${req.request_id}`;
    setBusy(key, true);
    const res = await rejectFriendRequestAction(Number(req.request_id));
    setBusy(key, false);
    if (res.success) {
      if (fromTab === 'requests') {
        setPending(prev => prev.filter(r => r.request_id !== req.request_id));
        toast.info("Solicitud ignorada");
      } else {
        setSent(prev => prev.filter(r => r.request_id !== req.request_id));
        toast.info("Solicitud cancelada");
      }
    } else {
      toast.error("No se pudo procesar la solicitud");
    }
  };

  const handleSendRequest = async (user: { username: string; name?: string; id?: string | number }) => {
    const key = `send-${user.username}`;
    setBusy(key, true);
    const res = await sendFriendRequestAction(user.username);
    setBusy(key, false);
    if (res.success) {
      toast.success(res.message || `Solicitud enviada a ${user.name || user.username}`);
      setSuggestions(prev => prev.filter(s => s.username !== user.username));
      setSearchResults(prev => prev ? prev.filter(s => s.username !== user.username) : prev);
      setSent(prev => [{ id: user.id ?? user.username, username: user.username, name: user.name || user.username, status: 'pending' }, ...prev]);
    } else {
      toast.error(res.error || "No se pudo enviar la solicitud");
    }
  };

  const handleRemoveFriend = async (friend: FriendUser) => {
    const key = `remove-${friend.id}`;
    setBusy(key, true);
    const res = await removeFriendAction(Number(friend.id));
    setBusy(key, false);
    if (res.success) {
      setFriends(prev => prev.filter(f => f.id !== friend.id));
      toast.success(`${friend.name} ya no es tu amigo`);
    } else {
      toast.error("No se pudo eliminar el amigo");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    const res = await searchExplore(searchQuery.trim());
    setIsSearching(false);
    setSearchResults(res.success ? res.users : []);
  };

  const tabs: { id: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { id: 'requests', label: 'Solicitudes', icon: UserPlus, count: pending.length },
    { id: 'sent', label: 'Enviadas', icon: Send, count: sent.length },
    { id: 'suggestions', label: 'Sugerencias', icon: Search },
    { id: 'friends', label: 'Mis Amigos', icon: Users, count: friends.length },
  ];

  const renderCard = (person: FriendUser | UserDTO, actions: React.ReactNode, key: string) => {
    const name = person.name || person.username;
    const username = person.username;
    const avatarUrl = 'avatar_url' in person ? person.avatar_url : undefined;

    return (
      <div key={key} className="bg-zentry-card border border-zentry-border rounded-2xl p-4 flex items-center gap-3 shadow-sm">
        <Link href={`/profile/${encodeURIComponent(username)}`} className="relative w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center shrink-0 border border-purple-500/30 overflow-hidden">
          {avatarUrl ? (
            <Image src={getImageUrl(avatarUrl)} alt={name} fill sizes="48px" className="object-cover" />
          ) : (
            getInitials(name)
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${encodeURIComponent(username)}`} className="text-sm font-black text-zentry-text-1 truncate block hover:text-zentry-accent transition-colors">
            {name}
          </Link>
          <p className="text-xs text-zentry-text-2 truncate">@{username}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">{actions}</div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zentry-text-1">Amigos</h1>
        <p className="text-sm text-zentry-text-2">Gestiona tus solicitudes de amistad y conecta con otros creadores.</p>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 p-1.5 bg-zentry-card border border-zentry-border rounded-2xl overflow-x-auto no-scrollbar">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-zentry-text-1 text-zentry-bg' : 'text-zentry-text-2 hover:text-zentry-text-1'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
              {typeof t.count === 'number' && t.count > 0 && (
                <span className="text-[10px] bg-zentry-accent text-white px-1.5 rounded-full">{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* SOLICITUDES RECIBIDAS */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <EmptyState icon={UserPlus} text="No tienes solicitudes de amistad pendientes." />
          ) : (
            pending.map(req => renderCard(req, (
              <>
                <button
                  onClick={() => handleAccept(req)}
                  disabled={busyIds.has(`accept-${req.request_id}`)}
                  className="p-2 bg-zentry-text-1 text-zentry-bg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  title="Aceptar"
                >
                  {busyIds.has(`accept-${req.request_id}`) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleReject(req, 'requests')}
                  disabled={busyIds.has(`reject-${req.request_id}`)}
                  className="p-2 bg-zentry-bg border border-zentry-border text-zentry-text-2 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
                  title="Ignorar"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ), `req-${req.request_id}`))
          )}
        </div>
      )}

      {/* SOLICITUDES ENVIADAS */}
      {tab === 'sent' && (
        <div className="space-y-3">
          {sent.length === 0 ? (
            <EmptyState icon={Send} text="No has enviado solicitudes de amistad." />
          ) : (
            sent.map(req => renderCard(req, (
              <button
                onClick={() => handleReject(req, 'sent')}
                disabled={busyIds.has(`reject-${req.request_id}`)}
                className="px-3 py-1.5 bg-zentry-bg border border-zentry-border text-zentry-text-2 rounded-xl text-xs font-bold hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
              >
                {busyIds.has(`reject-${req.request_id}`) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cancelar'}
              </button>
            ), `sent-${req.request_id || req.id}`))
          )}
        </div>
      )}

      {/* SUGERENCIAS + BUSCADOR */}
      {tab === 'suggestions' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-zentry-text-2 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar creadores por nombre o usuario..."
              className="w-full bg-zentry-card border border-zentry-border rounded-2xl pl-10 pr-20 py-3 text-sm text-zentry-text-1 focus:outline-none focus:border-zentry-accent transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-zentry-accent text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
            </button>
          </form>

          <div className="space-y-3">
            {(searchResults !== null ? searchResults : suggestions).length === 0 ? (
              <EmptyState icon={Search} text={searchResults !== null ? "No se encontraron creadores con ese nombre." : "No hay más sugerencias por ahora."} />
            ) : (
              (searchResults !== null ? searchResults : suggestions).map((person) => {
                const username = person.username;
                const name = person.name || username;
                return renderCard(person, (
                  <button
                    onClick={() => handleSendRequest({ username, name })}
                    disabled={busyIds.has(`send-${username}`)}
                    className="px-3 py-1.5 bg-zentry-text-1 text-zentry-bg rounded-xl text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {busyIds.has(`send-${username}`) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><UserPlus className="w-3.5 h-3.5" /> Agregar</>}
                  </button>
                ), `sugg-${username}`);
              })
            )}
          </div>
        </div>
      )}

      {/* MIS AMIGOS */}
      {tab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 ? (
            <EmptyState icon={Users} text="Aún no tienes amigos agregados. Ve a Sugerencias para encontrar creadores." />
          ) : (
            friends.map(friend => renderCard(friend, (
              <>
                <Link
                  href={`/messages?user=${encodeURIComponent(friend.username)}`}
                  className="p-2 bg-zentry-bg border border-zentry-border text-zentry-text-1 rounded-xl hover:border-zentry-accent hover:text-zentry-accent transition-colors"
                  title="Enviar mensaje"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleRemoveFriend(friend)}
                  disabled={busyIds.has(`remove-${friend.id}`)}
                  className="p-2 bg-zentry-bg border border-zentry-border text-zentry-text-2 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
                  title="Eliminar amigo"
                >
                  {busyIds.has(`remove-${friend.id}`) ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                </button>
              </>
            ), `friend-${friend.id}`))
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <div className="text-center py-14 px-4 bg-zentry-card border border-zentry-border rounded-3xl space-y-2">
      <Icon className="w-10 h-10 text-zentry-text-2 mx-auto opacity-40" />
      <p className="text-xs text-zentry-text-2 max-w-xs mx-auto">{text}</p>
    </div>
  );
}
