'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import {
  Project, ProjectTask, ProjectComment, ProjectMember, ProjectCategory, ProjectPriority,
  ProjectType, DriveItem, ProjectChapter, ProjectActivityItem,
} from '@/types'
import type { UserCosmetics } from '@/lib/shop'

// ---------------------------------------------------------------------------
// Mapeos backend → frontend
// ---------------------------------------------------------------------------

type BackendResource = {
  id: number; name: string; type: string; size: string; url: string | null; uploadedBy: string
  uploadedAt: string; folder?: string | null; mimeType?: string | null
}

function mapResource(r: BackendResource): DriveItem {
  return {
    id: String(r.id),
    name: r.name,
    type: r.type || 'LINK',
    size: r.size || '—',
    url: r.url,
    uploadedBy: r.uploadedBy,
    date: r.uploadedAt,
    folder: r.folder || '/',
    mimeType: r.mimeType,
    isFolder: (r.type || '').toUpperCase() === 'FOLDER',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendToProject(p: any): Project {
  const id = String(p.id)
  const title = p.title || `Proyecto #${id}`
  const category = p.category || 'General'
  const status = p.status === 'completed' ? 'completed' : p.status === 'paused' ? 'paused' : 'active'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: ProjectTask[] = (Array.isArray(p.tasks) ? p.tasks : []).map((t: any) => ({
    id: String(t.id),
    title: t.title || 'Tarea',
    completed: Boolean(t.completed),
    priority: t.priority || 'media',
    assignedTo: t.assignedTo || undefined,
    dueDate: t.dueDate || undefined,
  }))
  const completedTasksCount = tasks.filter(t => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : (status === 'completed' ? 100 : 0)

  const tags = p.tags
    ? (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : p.tags)
    : []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments: ProjectComment[] = (Array.isArray(p.notes) ? p.notes : []).map((n: any) => ({
    id: String(n.id),
    authorName: n.author || 'Usuario',
    authorUsername: n.author || 'usuario',
    authorAvatar: (n.author || 'ZN').substring(0, 2).toUpperCase(),
    content: n.content,
    createdAt: n.createdAt,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activities: ProjectActivityItem[] = (Array.isArray(p.activities) ? p.activities : []).map((a: any) => ({
    id: String(a.id),
    user: a.user,
    avatar: a.avatar,
    action: a.action,
    target: a.target,
    time: a.timestamp,
    iconType: a.iconType,
  }))

  return {
    id,
    title,
    name: title,
    description: p.description || '',
    category: category as ProjectCategory,
    priority: (p.priority || 'media') as ProjectPriority,
    progress,
    status,
    updatedAt: p.updatedAt,
    createdAt: p.createdAt,
    deadline: p.deadline || 'Sin fecha límite',
    tasksCount: tasks.length,
    completedTasksCount,
    members: [],
    tags,
    tasks,
    comments,
    resources: (Array.isArray(p.resources) ? p.resources : []).map(mapResource),
    activities,
    likesCount: Number(p.likesCount || 0),
    isLiked: Boolean(p.liked),
    authorUsername: p.ownerUsername || p.createdBy,
    authorName: p.ownerUsername || p.createdBy,
    authorAvatar: p.ownerAvatarUrl || undefined,
    visibility: p.visibility === 'public' ? 'public' : 'private',
    projectType: (p.projectType || 'general') as ProjectType,
    coverUrl: p.coverUrl || null,
    conversationId: p.conversationId ?? null,
    studioProjectId: p.studioProjectId ?? null,
    publishedPostId: p.publishedPostId ?? null,
    isOwner: Boolean(p.owner),
    isMember: Boolean(p.member),
    membersCount: Number(p.membersCount || 0),
    chaptersCount: Number(p.chaptersCount || 0),
  }
}

type BackendMember = {
  projectId: number; username: string; handle?: string; userId?: number; name?: string; avatarUrl?: string | null
  cosmetics?: UserCosmetics | null; role: string; joinedAt: string
}

function mapBackendMember(m: BackendMember): ProjectMember {
  const handle = m.handle || m.username.split('@')[0]
  return {
    id: m.username,
    name: m.name || handle,
    username: m.username,
    handle,
    userId: m.userId,
    avatar: handle.substring(0, 2).toUpperCase(),
    avatarUrl: m.avatarUrl ?? null,
    cosmetics: m.cosmetics ?? null,
    role: m.role === 'OWNER' ? 'Líder de Proyecto' : 'Colaborador',
    isOwner: m.role === 'OWNER',
    isOnline: false,
  }
}

type BackendChapter = {
  id: number; title: string; content: string | null; position: number; wordCount: number | null
  authorUsername?: string | null; lastEditedBy?: string | null; updatedAt?: string
}

function mapChapter(c: BackendChapter): ProjectChapter {
  return {
    id: String(c.id),
    title: c.title,
    content: c.content || '',
    position: c.position,
    wordCount: c.wordCount || 0,
    authorUsername: c.authorUsername,
    lastEditedBy: c.lastEditedBy,
    updatedAt: c.updatedAt,
  }
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

// ---------------------------------------------------------------------------
// Proyectos
// ---------------------------------------------------------------------------

export async function getProjectsAction(): Promise<{ success: boolean; data?: Project[]; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/projects')
    if (!res) return { success: false, data: [], error: 'No se pudieron cargar tus proyectos' }
    return { success: true, data: (Array.isArray(res) ? res : []).map(mapBackendToProject) }
  } catch (error) {
    return { success: false, data: [], error: errorMessage(error, 'Error al cargar proyectos') }
  }
}

export async function getPublicProjectsAction(page = 0): Promise<{ success: boolean; data: Project[]; hasMore: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/projects/public?page=${page}&size=20`)
    const content = res?.content || []
    return { success: Boolean(res), data: content.map(mapBackendToProject), hasMore: res ? !res.last : false }
  } catch {
    return { success: false, data: [], hasMore: false }
  }
}

export async function getProjectByIdAction(id: string | number): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const [project, members] = await Promise.all([
      fetchAPI(`/api/core/projects/${id}`),
      fetchAPI(`/api/core/projects/${id}/members`),
    ])
    if (!project) return { success: false, error: 'Proyecto no encontrado o es privado' }
    const mapped = mapBackendToProject(project)
    mapped.members = Array.isArray(members) ? members.map(mapBackendMember) : []
    return { success: true, data: mapped }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'Error al cargar el proyecto') }
  }
}

export async function createProjectAction(payload: {
  title: string
  description?: string
  category?: string
  priority?: string
  deadline?: string
  tags?: string[]
  projectType?: ProjectType
  visibility?: 'public' | 'private'
}): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const res = await fetchAPI('/api/core/projects', { method: 'POST', body: JSON.stringify(payload) })
    if (!res) return { success: false, error: 'No se pudo crear el proyecto' }
    revalidatePath('/projects')
    return { success: true, data: mapBackendToProject(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'Error al crear el proyecto') }
  }
}

export async function updateProjectAction(
  id: string | number,
  payload: Partial<{
    title: string; description: string; category: string; priority: string; status: string
    deadline: string; tags: string[]; visibility: 'public' | 'private'; coverUrl: string
  }>
): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
    if (!res) return { success: false, error: 'No tienes permiso para editar este proyecto' }
    return { success: true, data: mapBackendToProject(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'Error al actualizar el proyecto') }
  }
}

export async function uploadProjectCoverAction(id: string | number, formData: FormData): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/cover`, { method: 'POST', body: formData, timeoutMs: 120000 })
    if (!res) return { success: false, error: 'No se pudo subir la portada' }
    return { success: true, data: mapBackendToProject(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'Error al subir la portada') }
  }
}

export async function deleteProjectAction(id: string | number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}`, { method: 'DELETE' })
    if (!res) return { success: false, error: 'Solo el dueño puede eliminar el proyecto' }
    revalidatePath('/projects')
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'Error al eliminar el proyecto') }
  }
}

export async function publishProjectAction(id: string | number): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/publish`, { method: 'POST' })
    if (!res) return { success: false, error: 'Solo el dueño puede publicar el proyecto' }
    revalidatePath('/feed')
    return { success: true, data: mapBackendToProject(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo publicar el proyecto') }
  }
}

export async function toggleProjectLikeAction(projectId: string | number): Promise<{ success: boolean; isLiked?: boolean; likesCount?: number }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/like`, { method: 'POST' })
    return { success: !!res, isLiked: res?.liked, likesCount: res?.likesCount }
  } catch {
    return { success: false }
  }
}

// ---------------------------------------------------------------------------
// Miembros, chat y voz
// ---------------------------------------------------------------------------

export async function getProjectMembersAction(id: string | number): Promise<{ success: boolean; data: ProjectMember[] }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/members`)
    return { success: Array.isArray(res), data: Array.isArray(res) ? res.map(mapBackendMember) : [] }
  } catch {
    return { success: false, data: [] }
  }
}

export async function inviteProjectMemberAction(id: string | number, username: string): Promise<{ success: boolean; data?: ProjectMember; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ username: username.replace(/^@/, '').trim() }),
    })
    if (!res) return { success: false, error: 'No se encontró a ese usuario' }
    return { success: true, data: mapBackendMember(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo agregar al colaborador') }
  }
}

export async function removeProjectMemberAction(id: string | number, username: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/members/${encodeURIComponent(username)}`, { method: 'DELETE' })
    if (!res) return { success: false, error: 'No tienes permiso para quitar a este miembro' }
    return { success: true }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo quitar al miembro') }
  }
}

export async function getProjectChatAction(id: string | number): Promise<{ success: boolean; conversationId?: number }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/chat`)
    return { success: Boolean(res?.conversationId), conversationId: res?.conversationId }
  } catch {
    return { success: false }
  }
}

export type VoiceParticipant = { userId: number; username: string; avatarUrl?: string | null; muted: boolean; joinedAt: number }

export async function getVoiceParticipantsAction(id: string | number): Promise<VoiceParticipant[]> {
  try {
    const res = await fetchAPI(`/api/core/projects/${id}/voice`)
    return Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Libro (capítulos)
// ---------------------------------------------------------------------------

export async function getChaptersAction(projectId: string | number): Promise<{ success: boolean; data: ProjectChapter[] }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/chapters`)
    return { success: Array.isArray(res), data: Array.isArray(res) ? res.map(mapChapter) : [] }
  } catch {
    return { success: false, data: [] }
  }
}

export async function addChapterAction(projectId: string | number, payload: { title?: string; content?: string }): Promise<{ success: boolean; data?: ProjectChapter; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/chapters`, { method: 'POST', body: JSON.stringify(payload) })
    if (!res) return { success: false, error: 'Solo los miembros pueden escribir capítulos' }
    return { success: true, data: mapChapter(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo crear el capítulo') }
  }
}

export async function updateChapterAction(
  projectId: string | number,
  chapterId: string,
  payload: { title?: string; content?: string; position?: number }
): Promise<{ success: boolean; data?: ProjectChapter; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(payload) })
    if (!res) return { success: false, error: 'No se pudo guardar el capítulo' }
    return { success: true, data: mapChapter(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo guardar el capítulo') }
  }
}

export async function deleteChapterAction(projectId: string | number, chapterId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/chapters/${chapterId}`, { method: 'DELETE' })
    return res ? { success: true } : { success: false, error: 'No se pudo eliminar el capítulo' }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo eliminar el capítulo') }
  }
}

// ---------------------------------------------------------------------------
// Drive
// ---------------------------------------------------------------------------

/** formData: files (uno o varios) + folder; o name/type/url para carpetas y enlaces */
export async function uploadDriveFilesAction(projectId: string | number, formData: FormData): Promise<{ success: boolean; data?: DriveItem[]; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/resources`, { method: 'POST', body: formData, timeoutMs: 5 * 60 * 1000 })
    if (!Array.isArray(res)) return { success: false, error: 'No se pudieron subir los archivos' }
    return { success: true, data: res.map(mapResource) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'Error al subir archivos') }
  }
}

export async function createDriveFolderAction(projectId: string | number, name: string, folder: string): Promise<{ success: boolean; data?: DriveItem; error?: string }> {
  const formData = new FormData()
  formData.set('name', name)
  formData.set('type', 'FOLDER')
  formData.set('folder', folder)
  const res = await uploadDriveFilesAction(projectId, formData)
  return res.success && res.data?.[0] ? { success: true, data: res.data[0] } : { success: false, error: res.error || 'No se pudo crear la carpeta' }
}

export async function addDriveLinkAction(projectId: string | number, name: string, url: string, folder: string): Promise<{ success: boolean; data?: DriveItem; error?: string }> {
  const formData = new FormData()
  formData.set('name', name)
  formData.set('type', 'LINK')
  formData.set('url', url)
  formData.set('folder', folder)
  const res = await uploadDriveFilesAction(projectId, formData)
  return res.success && res.data?.[0] ? { success: true, data: res.data[0] } : { success: false, error: res.error || 'No se pudo guardar el enlace' }
}

export async function updateDriveItemAction(projectId: string | number, itemId: string, payload: { name?: string; folder?: string }): Promise<{ success: boolean; data?: DriveItem; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/resources/${itemId}`, { method: 'PUT', body: JSON.stringify(payload) })
    if (!res) return { success: false, error: 'No se pudo actualizar' }
    return { success: true, data: mapResource(res) }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo actualizar') }
  }
}

export async function deleteDriveItemAction(projectId: string | number, itemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/resources/${itemId}`, { method: 'DELETE' })
    return res ? { success: true } : { success: false, error: 'No se pudo eliminar' }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo eliminar') }
  }
}

// ---------------------------------------------------------------------------
// Tareas y notas
// ---------------------------------------------------------------------------

export async function addProjectTaskAction(
  projectId: string | number,
  payload: { title: string; priority?: string; assignedTo?: string; dueDate?: string }
): Promise<{ success: boolean; data?: ProjectTask; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(payload) })
    if (!res) return { success: false, error: 'No se pudo crear la tarea' }
    return {
      success: true,
      data: { id: String(res.id), title: res.title, completed: Boolean(res.completed), priority: res.priority, assignedTo: res.assignedTo, dueDate: res.dueDate },
    }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo crear la tarea') }
  }
}

export async function toggleProjectTaskAction(projectId: string | number, taskId: string): Promise<{ success: boolean; completed?: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/tasks/${taskId}/toggle`, { method: 'PUT' })
    return { success: !!res, completed: res?.completed }
  } catch {
    return { success: false }
  }
}

export async function deleteTaskAction(projectId: string | number, taskId: string): Promise<{ success: boolean }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' })
    return { success: !!res }
  } catch {
    return { success: false }
  }
}

export async function addNoteAction(projectId: string | number, content: string): Promise<{ success: boolean; data?: ProjectComment; error?: string }> {
  try {
    const res = await fetchAPI(`/api/core/projects/${projectId}/notes`, { method: 'POST', body: JSON.stringify({ content }) })
    if (!res) return { success: false, error: 'No se pudo guardar la nota' }
    return {
      success: true,
      data: {
        id: String(res.id),
        authorName: res.author,
        authorUsername: res.author,
        authorAvatar: (res.author || 'ZN').substring(0, 2).toUpperCase(),
        content: res.content,
        createdAt: res.createdAt,
      },
    }
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo guardar la nota') }
  }
}


// Compatibilidad hacia atrás con vistas de detalle de proyecto
export const addProjectCommentAction = addNoteAction;

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
