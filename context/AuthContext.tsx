"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
  id: number | string;
  username: string;
  name?: string;
  email: string;
  avatar_url?: string;
  banner_url?: string;
  zentry_coins?: number;
  followersCount?: number;
  postsCount?: number;
  discipline?: string;
  bio?: string;
  location?: string;
};

type AuthContextType = {
  user: User | null;
  loginState: (userData: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Cargar usuario persistido en localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('zentry_user');

    if (storedData && storedData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedData);
        // Si hay un avatar local guardado para este usuario, fusionarlo
        const cleanU = (parsedUser.username || '').replace(/^@/, '').toLowerCase().trim();
        const localAvatar = localStorage.getItem(`zentry_custom_avatar_${cleanU}`);
        const localBanner = localStorage.getItem(`zentry_custom_banner_${cleanU}`);

        const mergedUser = {
          ...parsedUser,
          avatar_url: localAvatar || parsedUser.avatar_url,
          banner_url: localBanner || parsedUser.banner_url
        };

        setTimeout(() => {
          setUser(mergedUser);
        }, 0);
      } catch (error) {
        console.error("Error al parsear el JSON del usuario:", error);
        localStorage.removeItem('zentry_user'); 
      }
    }
  }, []);
  
  // Guardar sesión tras login
  const loginState = (userData: User, token: string) => {
    const cleanU = (userData.username || '').replace(/^@/, '').toLowerCase().trim();
    const localAvatar = localStorage.getItem(`zentry_custom_avatar_${cleanU}`);
    const localBanner = localStorage.getItem(`zentry_custom_banner_${cleanU}`);

    const finalUser = {
      ...userData,
      avatar_url: localAvatar || userData.avatar_url,
      banner_url: localBanner || userData.banner_url
    };

    setUser(finalUser);
    localStorage.setItem('zentry_user', JSON.stringify(finalUser));
    document.cookie = `zentry_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    
    router.push('/feed');
  };

  // Actualizar datos del usuario actual
  const updateUser = (partial: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const cleanU = (prev.username || '').replace(/^@/, '').toLowerCase().trim();

      if (partial.avatar_url) {
        localStorage.setItem(`zentry_custom_avatar_${cleanU}`, partial.avatar_url);
      }
      if (partial.banner_url) {
        localStorage.setItem(`zentry_custom_banner_${cleanU}`, partial.banner_url);
      }

      const updated = { ...prev, ...partial };
      localStorage.setItem('zentry_user', JSON.stringify(updated));
      return updated;
    });
  };

  // Cerrar sesión
  const logout = () => {
    if (user?.username) {
      const cleanU = (user.username || '').replace(/^@/, '').toLowerCase().trim();
      localStorage.removeItem(`zentry_online_${cleanU}`);
      localStorage.setItem(`zentry_presence_${cleanU}`, 'offline');
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('zentry_presence');
          bc.postMessage({ type: 'PRESENCE_UPDATE', username: cleanU, status: 'offline' });
          bc.close();
        } catch {}
      }
    }

    setUser(null);
    localStorage.removeItem('zentry_user');
    document.cookie = "zentry_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loginState, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loginState: () => {},
      updateUser: () => {},
      logout: () => {}
    };
  }
  return context;
};