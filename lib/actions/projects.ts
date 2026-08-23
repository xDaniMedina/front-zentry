'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Project, ProjectTask, ProjectComment, ProjectMember } from '@/types'

function mapBackendToProject(p: any): Project {
  if (!p) return {} as Project;

  const id = String(p.id || Math.random().toString(36).substr(2, 9));
  const title = p.title || `Proyecto #${id}`;
  const description = p.description || 'Sin descripción proporcionada.';
  const category = p.category || 'UI/UX';
  const priority = p.priority || 'media';
  const status = p.status === 'completed' ? 'completed' : p.status === 'paused' ? 'paused' : 'active';

  const rawTasks = Array.isArray(p.tasks) ? p.tasks : [];
  const tasks: ProjectTask[] = rawTasks.map((t: any, idx: number) => ({
    id: String(t.id || `t-${idx}`),
    title: t.title || 'Tarea',
    completed: Boolean(t.completed),
    priority: t.priority || 'media',
    assignedTo: t.assignedTo || undefined,
    dueDate: t.dueDate || undefined,
  }));

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const tasksCount = tasks.length;
  const progress = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

  const creatorName = p.createdBy || 'Creador Zentry';
  const creatorAvatar = creatorName.length >= 2 ? creatorName.substring(0, 2).toUpperCase() : 'ZN';

  const members: ProjectMember[] = [
    { id: 'u1', name: creatorName, avatar: creatorAvatar, role: 'Líder de Proyecto', isOnline: true }
  ];

  const tags = p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : p.tags) : [category];

  return {
    id,
    title,
    name: title,
    description,
    category: category as any,
    priority: priority as any,
    progress,
    status,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Reciente',
    createdAt: p.createdAt,
    deadline: p.deadline || 'Sin fecha límite',
    tasksCount,
    completedTasksCount,
    members,
    tags,
    tasks,
    activities: p.activities || [],
    resources: p.resources || [],
    notes: p.notes || []
  } as unknown as Project;
}

export async function getProjectsAction(): Promise<{ success: boolean; data?: Project[]; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/projects')
    if (!res) {
      return { success: true, data: [] }
    }
    const list = Array.isArray(res) ? res : (res.data || res.content || [])
    return { success: true, data: list.map(mapBackendToProject) }
  } catch (error) {
    console.error('Error al obtener proyectos:', error)
    return { success: false, error: 'Error al conectar con el servidor de proyectos' }
  }
}

export async function getProjectByIdAction(id: string | number): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}`)
    if (!res) {
      return { success: false, error: 'Proyecto no encontrado' }
    }
    return { success: true, data: mapBackendToProject(res) }
  } catch (error) {
    console.error(`Error al obtener proyecto ${id}:`, error)
    return { success: false, error: 'Error al cargar proyecto' }
  }
}

export async function createProjectAction(payload: {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  deadline?: string;
  tags?: string[];
}): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!res) {
      return { success: false, error: 'No se pudo crear el proyecto' }
    }

    revalidatePath('/projects')
    return { success: true, data: mapBackendToProject(res) }
  } catch (error) {
    console.error('Error al crear proyecto:', error)
    return { success: false, error: 'Error de red' }
  }
}

export async function updateProjectAction(
  id: string | number,
  payload: Partial<Project> & { tags?: string[] }
): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    if (!res) {
      return { success: false, error: 'No se pudo actualizar el proyecto' }
    }

    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    return { success: true, data: mapBackendToProject(res) }
  } catch (error) {
    console.error(`Error al actualizar proyecto ${id}:`, error)
    return { success: false, error: 'Error de red' }
  }
}

export async function deleteProjectAction(id: string | number): Promise<{ success: boolean }> {
  try {
    await fetchAPI(`/api/core/projects/${id}`, {
      method: 'DELETE',
    })

    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar proyecto ${id}:`, error)
    return { success: false }
  }
}

export async function addTaskAction(
  projectId: string | number,
  payload: { title: string; priority?: string; assignedTo?: string; dueDate?: string }
): Promise<{ success: boolean; data?: ProjectTask; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    revalidatePath(`/projects/${projectId}`)
    return { 
      success: !!res, 
      data: res ? {
        id: String(res.id),
        title: res.title,
        completed: Boolean(res.completed),
        priority: res.priority,
        assignedTo: res.assignedTo,
        dueDate: res.dueDate
      } : undefined 
    }
  } catch (error) {
    console.error(`Error al añadir tarea al proyecto ${projectId}:`, error)
    return { success: false, error: 'Error al añadir tarea' }
  }
}

export const addProjectTaskAction = addTaskAction;

export async function toggleTaskAction(
  projectId: string | number,
  taskId: string | number,
  completed?: boolean
): Promise<{ success: boolean; data?: ProjectTask }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/tasks/${taskId}/toggle`, {
      method: 'PUT',
      body: completed !== undefined ? JSON.stringify({ completed }) : undefined,
    })

    revalidatePath(`/projects/${projectId}`)
    return { 
      success: !!res, 
      data: res ? {
        id: String(res.id),
        title: res.title,
        completed: Boolean(res.completed),
        priority: res.priority,
        assignedTo: res.assignedTo,
        dueDate: res.dueDate
      } : undefined 
    }
  } catch (error) {
    console.error(`Error al alternar tarea ${taskId}:`, error)
    return { success: false }
  }
}

export const toggleProjectTaskAction = toggleTaskAction;

export async function deleteTaskAction(
  projectId: string | number,
  taskId: string | number
): Promise<{ success: boolean }> {
  try {
    await fetchAPI(`/api/core/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar tarea ${taskId}:`, error)
    return { success: false }
  }
}

export async function addResourceAction(
  projectId: string | number,
  payload: { name: string; type: string; size: string; url?: string }
): Promise<{ success: boolean; data?: any }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/resources`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: !!res, data: res }
  } catch (error) {
    console.error(`Error al añadir recurso al proyecto ${projectId}:`, error)
    return { success: false }
  }
}

export async function addNoteAction(
  projectId: string | number,
  content: string
): Promise<{ success: boolean; data?: any }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })

    revalidatePath(`/projects/${projectId}`)
    return { success: !!res, data: res }
  } catch (error) {
    console.error(`Error al añadir nota al proyecto ${projectId}:`, error)
    return { success: false }
  }
}

export async function addProjectCommentAction(
  projectId: string | number,
  content: string
): Promise<{ success: boolean; data?: ProjectComment }> {
  try {
    const res = await addNoteAction(projectId, content);
    return {
      success: res.success,
      data: res.data ? {
        id: String(res.data.id || Date.now()),
        authorName: res.data.author || 'Usuario',
        authorUsername: res.data.author || 'usuario',
        authorAvatar: 'ZN',
        content,
        createdAt: 'Justo ahora'
      } : undefined
    }
  } catch (error) {
    return { success: false }
  }
}

export async function toggleProjectLikeAction(projectId: string | number): Promise<{ success: boolean; isLiked?: boolean }> {
  return { success: true, isLiked: true }
}

export async function joinProjectAction(projectId: string | number): Promise<{ success: boolean }> {
  return { success: true }
}

