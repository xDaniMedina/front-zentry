import { getStudioProjects } from "@/lib/actions/studio";
import StudioClient from "./StudioClient";

export default async function StudioPage() {
  const res = await getStudioProjects();
  const studioData = res.success && res.data ? res.data : [];

  return <StudioClient initialFiles={studioData} />;
}