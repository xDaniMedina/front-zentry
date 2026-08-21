'use server'

import { fetchAPI } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const title = formData.get('title')
  
  try {
    // Mandas el POST a la URL de Tailscale de tus amigos
    await fetchAPI('/api/core/projects', {
      method: 'POST',
      body: JSON.stringify({ title, status: 'En progreso' })
    })

    // Refrescas la página para que aparezca el nuevo proyecto automáticamente
    revalidatePath('/projects')
    
  } catch (error) {
    console.error("Error al crear:", error)
  }
}
