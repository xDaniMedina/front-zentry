import { getStudioProjectById } from "@/lib/actions/studio";
import EditorClient from "./EditorClient";

interface StudioEditorPageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ type?: string; title?: string }> | { type?: string; title?: string };
}

export default async function StudioEditorPage({ params, searchParams }: StudioEditorPageProps) {
  const resolvedParams = await params;
  const resolvedQuery = searchParams ? await searchParams : {};
  
  let initialProject = undefined;
  if (resolvedParams.id && resolvedParams.id !== 'new' && !isNaN(Number(resolvedParams.id))) {
    const res = await getStudioProjectById(resolvedParams.id);
    if (res.success && res.data) {
      initialProject = res.data;
    }
  }

  if (!initialProject && (resolvedQuery.title || resolvedQuery.type)) {
    initialProject = {
      id: resolvedParams.id,
      title: resolvedQuery.title ? decodeURIComponent(resolvedQuery.title) : 'Nuevo Proyecto',
      type: (resolvedQuery.type as any) || 'canvas',
      lastEdited: 'Justo ahora',
      reward: 50,
      content: ''
    };
  }

  return <EditorClient canvasId={resolvedParams.id} initialProject={initialProject} />;
}
