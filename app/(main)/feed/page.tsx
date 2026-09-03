import { cookies } from 'next/headers';
import { fetchAPI } from "@/lib/api";
import FeedClient from "./FeedClient";

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  let feedData = null;

  try {
    const cookieStore = await cookies(); 
    const token = cookieStore.get('zentry_token')?.value;

    if (token) {
       feedData = await fetchAPI('/api/core/posts'); 
    } else {
       console.log("No hay token, el usuario no está logueado.");
    }
  } catch (error) {
    console.error("Error al cargar el Feed:", error);
  }

  return <FeedClient initialPosts={feedData} />;
}