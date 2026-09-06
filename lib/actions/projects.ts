'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Project, ProjectTask, ProjectComment, ProjectMember, ProjectCategory, ProjectPriority } from '@/types'

function mapBackendToProject(p: any): Project {
  const id = String(p.id);
  const title = p.title || `Proyecto #${id}`;
  const description = p.description || 'Sin descripción proporcionada.';
  const category = p.category || 'UI/UX';
  const priority = p.priority || 'media';
  const status = p.status === 'completed' ? 'completed' : p.status === 'paused' ? 'paused' : 'active';

  const rawTasks = Array.isArray(p.tasks) ? p.tasks : [];

  const tasks: ProjectTask[] = rawTasks.map((t: any) => ({
    id: String(t.id),
    title: t.title || 'Tarea',
    completed: Boolean(t.completed),
    priority: t.priority || 'media',
    assignedTo: t.assignedTo || undefined,
    dueDate: t.dueDate || undefined,
  }));

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const tasksCount = tasks.length;
  const progress = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;

  const tags = p.tags ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : p.tags) : [category];

  const comments: ProjectComment[] = Array.isArray(p.notes) ? p.notes.map((n: any) => ({
    id: String(n.id),
    authorName: n.author || 'Usuario',
    authorUsername: n.author || 'usuario',
    authorAvatar: (n.author || 'ZN').substring(0, 2).toUpperCase(),
    content: n.content,
    createdAt: n.createdAt,
  })) : [];

  const resources = Array.isArray(p.resources) ? p.resources.map((r: any) => ({
    id: String(r.id),
    name: r.name,
    type: r.type,
    size: r.size,
    uploadedBy: r.uploadedBy,
    date: r.uploadedAt,
    url: r.url,
  })) : [];

  const activities = Array.isArray(p.activities) ? p.activities.map((a: any) => ({
    id: String(a.id),
    user: a.user,
    avatar: a.avatar,
    action: a.action,
    target: a.target,
    time: a.timestamp,
    iconType: a.iconType,
  })) : [];

  return {
    id,
    title,
    name: title,
    description,
    category: category as ProjectCategory,
    priority: priority as ProjectPriority,
    progress,
    status,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Reciente',
    createdAt: p.createdAt,
    deadline: p.deadline || 'Sin fecha límite',
    tasksCount,
    completedTasksCount,
    members: [],
    tags,
    tasks,
    comments,
    resources,
    activities,
    likesCount: 0,
    isLiked: false,
    authorUsername: p.createdBy,
    authorName: p.createdBy,
  } as unknown as Project;
}

function mapBackendMember(m: { projectId: number; username: string; role: string; joinedAt: string }): ProjectMember {
  return {
    id: m.username,
    name: m.username,
    username: m.username,
    avatar: m.username.substring(0, 2).toUpperCase(),
    role: m.role === 'OWNER' ? 'Líder de Proyecto' : 'Colaborador',
    isOnline: false,
  };
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
    const [res, membersRes, likeRes] = await Promise.all([
      fetchAPI(`/api/core/projects/${id}`),
      fetchAPI(`/api/core/projects/${id}/members`),
      fetchAPI(`/api/core/projects/${id}/like`),
    ])
    if (!res) {
      return { success: false, error: 'Proyecto no encontrado' }
    }
    const project = mapBackendToProject(res)
    project.members = Array.isArray(membersRes) ? membersRes.map(mapBackendMember) : []
    project.likesCount = likeRes?.likesCount ?? 0
    project.isLiked = Boolean(likeRes?.liked)
    return { success: true, data: project }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Error al cargar proyecto'
    console.error(`Error al obtener proyecto ${id}:`, error)
    return { success: false, error: message }
  }
}

export async function getProjectMembersAction(id: string | number): Promise<{ success: boolean; data: ProjectMember[] }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/members`)
    return { success: true, data: Array.isArray(res) ? res.map(mapBackendMember) : [] }
  } catch (error) {
    console.error(`Error al obtener colaboradores del proyecto ${id}:`, error)
    return { success: false, data: [] }
  }
}

export async function inviteProjectMemberAction(id: string | number, username: string): Promise<{ success: boolean; data?: ProjectMember; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    })
    if (!res) {
      return { success: false, error: 'No se pudo invitar al colaborador' }
    }
    revalidatePath(`/projects/${id}`)
    return { success: true, data: mapBackendMember(res) }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo invitar al colaborador'
    console.error(`Error al invitar colaborador al proyecto ${id}:`, error)
    return { success: false, error: message }
  }
}

export async function removeProjectMemberAction(id: string | number, username: string): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchAPI(`/api/core/projects/${id}/members/${encodeURIComponent(username)}`, { method: 'DELETE' })
    revalidatePath(`/projects/${id}`)
    return { success: true }
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo quitar al colaborador'
    console.error(`Error al quitar colaborador del proyecto ${id}:`, error)
    return { success: false, error: message }
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
): Promise<{ success: boolean; data?: ProjectComment; error?: string }> {
  const res = await addNoteAction(projectId, content);
  if (!res.success || !res.data) {
    return { success: false, error: 'No se pudo agregar la nota' }
  }
  return {
    success: true,
    data: {
      id: String(res.data.id),
      authorName: res.data.author || 'Usuario',
      authorUsername: res.data.author || 'usuario',
      authorAvatar: (res.data.author || 'ZN').substring(0, 2).toUpperCase(),
      content: res.data.content,
      createdAt: res.data.createdAt,
    }
  }
}

export async function toggleProjectLikeAction(projectId: string | number): Promise<{ success: boolean; isLiked?: boolean; likesCount?: number }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/like`, { method: 'POST' })
    if (!res) {
      return { success: false }
    }
    return { success: true, isLiked: res.liked, likesCount: res.likesCount }
  } catch (error) {
    console.error(`Error al dar me gusta al proyecto ${projectId}:`, error)
    return { success: false }
  }
}

