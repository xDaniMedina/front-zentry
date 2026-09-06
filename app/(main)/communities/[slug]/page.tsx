import { getCommunityBySlug, getCommunityPostsAction } from "@/lib/actions/communities";
import CommunityDetailClient from "./CommunityDetailClient";

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CommunityDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const [communityRes, postsRes] = await Promise.all([
    getCommunityBySlug(slug),
    getCommunityPostsAction(slug),
  ]);

  return <CommunityDetailClient slug={slug} initialData={communityRes.data ?? null} initialPosts={postsRes.data} />;
}
