import ProfileClient from "./ProfileCliente";
import { fetchAPI } from "@/lib/api";
import { notFound } from "next/navigation"; // 1. Importamos notFound

type Props = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const rawUsername = resolvedParams.username;
  const decoded = decodeURIComponent(rawUsername);
  
  // Sanitizar si el nombre viene como correo electrónico (ej: dani12@gmail.com -> dani12)
  const cleanUsername = decoded.includes('@') ? decoded.split('@')[0] : decoded;
  
  let profileData = null;
  
  try {
    profileData = await fetchAPI(`/api/core/profiles/${encodeURIComponent(cleanUsername)}`);
  } catch (error) {
    console.error("Error al cargar el perfil desde el backend:", error);
  }

  return <ProfileClient initialData={profileData} username={cleanUsername} />;
}