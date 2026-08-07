import { fetchAPI } from "@/lib/api";
import FeedClient from "./FeedClient";

export default async function FeedPage() {
  let feedData = null;

  try {
    // ¡Ojo aquí! Pregúntale a tus compañeros cuál es la ruta exacta para obtener el feed
    // Podría ser '/posts', '/feed', o '/api/v1/posts'
    feedData = await fetchAPI('/posts');
  } catch (error) {
    console.error("El backend de Zentry no está disponible para el Feed:", error);
  }

  return <FeedClient initialPosts={feedData} />;
}

