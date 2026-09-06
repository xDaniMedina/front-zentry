import { getFeedPosts } from "@/lib/actions/feed";
import FeedClient from "./FeedClient";

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const res = await getFeedPosts();
  return <FeedClient initialPosts={res.success ? res.data : []} />;
}
