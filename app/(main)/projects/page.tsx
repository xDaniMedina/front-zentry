import { fetchAPI } from "@/lib/api";
import ProjectsClient from "./ProjectsClient";
//import ProjectDetailClient from "./ProjectDetailClient";

export default async function ProjectsPage() {
  let data = null;
  try {
    data = await fetchAPI('/api/core/projects');
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
  }
  return <ProjectsClient initialProjects={data} />;
}
