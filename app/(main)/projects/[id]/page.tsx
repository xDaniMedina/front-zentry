import { getProjectByIdAction } from "@/lib/actions/projects";
import ProjectDetailClient from "./ProjectDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const res = await getProjectByIdAction(resolvedParams.id);
  return <ProjectDetailClient projectId={resolvedParams.id} initialProject={res.data || null} />;
}
