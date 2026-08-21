import { fetchAPI } from "@/lib/api";
import ExploreClient from "./ExploreClient";

export default async function ExplorePage() {
  let initialTrending = null;

  try {
    const response = await fetchAPI('/api/core/explore/trending');
    if (response) {
      initialTrending = response;
    }
  } catch (err) {
    console.error("No se pudo conectar al endpoint de explorar en el backend:", err);
  }

  return <ExploreClient initialTrending={initialTrending} />;
}