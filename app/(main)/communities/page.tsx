import { fetchAPI } from "@/lib/api";
import CommunitiesClient from "./CommunitiesClient";

export default async function CommunitiesPage() {
  let communitiesData = null;

  try {
    communitiesData = await fetchAPI('/communities');
  } catch (error) {
    console.error("El backend no está disponible para Comunidades:", error);
  }

  return <CommunitiesClient initialData={communitiesData} />;
}


