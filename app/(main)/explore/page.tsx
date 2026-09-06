import { fetchTrending } from "@/lib/actions/explore";
import ExploreClient from "./ExploreClient";

export default async function ExplorePage() {
  const res = await fetchTrending();
  return <ExploreClient initialTrending={res.data} />;
}
