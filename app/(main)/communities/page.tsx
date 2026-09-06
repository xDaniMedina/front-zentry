import { getCommunities } from "@/lib/actions/communities";
import CommunitiesClient from "./CommunitiesClient";

export default async function CommunitiesPage() {
  const res = await getCommunities();
  return <CommunitiesClient initialData={res.data} />;
}
