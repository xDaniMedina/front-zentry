import { fetchAPI } from "@/lib/api";
import CommunityDetailClient from "./CommunityDetailClient";

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CommunityDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let communityData = null;
  
  try {
    communityData = await fetchAPI(`/api/core/communities/${slug}`);
  } catch (error) {
    console.error("Error al cargar la comunidad desde el backend:", error);
  }
  
  return <CommunityDetailClient slug={slug} initialData={communityData} />;
}
