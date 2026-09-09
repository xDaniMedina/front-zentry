'use server'

import { fetchAPI } from '@/lib/api'

type BackendAd = {
  id: string
  userId: number
  nombre: string
  headline: string | null
  body: string | null
  imageUrl: string | null
  linkUrl: string | null
  ctaLabel: string | null
  placement: string | null
  isActive: boolean | null
}

export type AdDTO = {
  id: string
  headline: string
  body: string
  icon: string
  linkUrl: string
  ctaLabel: string
}

function toAdDTO(a: BackendAd): AdDTO {
  return {
    id: a.id,
    headline: a.headline || a.nombre,
    body: a.body || '',
    icon: a.imageUrl || '📣',
    linkUrl: a.linkUrl || '#',
    ctaLabel: a.ctaLabel || 'Ver más',
  }
}

export async function getActiveAdsAction(placement: 'FEED' | 'SIDEBAR' | 'BOTH' = 'BOTH'): Promise<{ success: boolean; data: AdDTO[] }> {
  try {
    const res: BackendAd[] | null = await fetchAPI(`/api/business/ads-campaigns/active?placement=${placement}`)
    return { success: true, data: (res || []).map(toAdDTO) }
  } catch (error) {
    console.error('Error al obtener anuncios:', error)
    return { success: false, data: [] }
  }
}

export async function recordAdImpressionAction(adId: string): Promise<void> {
  try {
    await fetchAPI(`/api/business/ads-campaigns/${adId}/impression`, { method: 'POST' })
  } catch (error) {
    console.error('Error al registrar impresión de anuncio:', error)
  }
}
