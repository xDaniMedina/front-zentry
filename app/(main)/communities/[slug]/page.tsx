import CommunityDetailClient from "./CommunityDetailClient";

export default async function CommunityDetailPage({ params }: { params: { slug: string } }) {
  // Aquí en el futuro harás un fetchAPI(`/communities/${params.slug}`)
  
  return <CommunityDetailClient slug={params.slug} />;
}

