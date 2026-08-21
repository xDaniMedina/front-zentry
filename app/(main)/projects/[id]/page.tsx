import ProjectDetailClient from "./ProjectDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const resolvedParams = await params;
  return <ProjectDetailClient projectId={resolvedParams.id} />;
}

