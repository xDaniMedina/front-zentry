import ProfileClient from "./ProfileCliente";
import { fetchAPI } from "@/lib/api";
import { notFound } from "next/navigation"; // 1. Importamos notFound

type Props = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  
  let profileData = null;
  
  try {
    profileData = await fetchAPI(`/api/core/profiles/${username}`);
    
    if (!profileData) {
      notFound();
    }
    
  } catch (error) {
    console.error("Error al cargar el perfil desde el backend:", error);
    notFound();
  }

  return <ProfileClient initialData={profileData} username={username} />;
}