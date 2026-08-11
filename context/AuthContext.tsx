"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loginState: (userData: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // UN SOLO useEffect consolidado y seguro
  useEffect(() => {
    const storedData = localStorage.getItem('zentry_user');

    if (storedData && storedData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedData);
        // Mantenemos el setTimeout que tenías originalmente
        setTimeout(() => {
          setUser(parsedUser);
        }, 0);
      } catch (error) {
        console.error("Error al parsear el JSON del usuario:", error);
        localStorage.removeItem('zentry_user'); 
      }
    }
  }, []);
  
  // Función para guardar sesión
  const loginState = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('zentry_user', JSON.stringify(userData));
    // Guardamos el token en una Cookie (expira en 7 días)
    document.cookie = `zentry_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; Secure; SameSite=Strict`;
    
    router.push('/feed');
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('zentry_user');
    document.cookie = "zentry_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"; // Destruimos la cookie
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loginState, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};