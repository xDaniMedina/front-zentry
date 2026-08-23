import { getProjectsAction } from "@/lib/actions/projects";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const res = await getProjectsAction();
  return <ProjectsClient initialProjects={res.data || []} />;
}
