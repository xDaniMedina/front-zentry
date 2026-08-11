import { fetchAPI } from "@/lib/api";
import StudioClient, { StudioFile } from "./StudioClient";

type BackendPost = {
  id: number;
  title: string;
  createdAt: string;
}

export default async function StudioPage() {
  let studioData: StudioFile[] = [];

  try {
    const response = await fetchAPI('/api/core/posts');
    const posts = response?.content || [];

    studioData = posts.map((post: BackendPost) => ({
      id: post.id.toString(),
      title: post.title,
      type: 'image',
      lastEdited: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recientemente'
    }));

  } catch (error) {
    console.error("El backend no está disponible para el Estudio:", error);
  }
  
  return <StudioClient initialFiles={studioData} />;
}