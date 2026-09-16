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
  brandName?: string
  logoUrl?: string
  linkUrl: string
  ctaLabel: string
}

const REAL_BRAND_ADS: AdDTO[] = [
  {
    id: "ad-duolingo",
    headline: "Duolingo: Aprende idiomas gratis",
    body: "Domina inglés, francés o japonés practicando solo 15 minutos al día. ¡Únete a más de 500M de estudiantes!",
    icon: "🦉",
    brandName: "Duolingo",
    linkUrl: "https://www.duolingo.com",
    ctaLabel: "Probar Gratis"
  },
  {
    id: "ad-dominos",
    headline: "Domino's Pizza: 2x1 en tus especialidades",
    body: "Pide tus pizzas favoritas a domicilio con queso extra y la masa recién horneada. Usá el cupón ZENTRY2X1",
    icon: "🍕",
    brandName: "Domino's Pizza",
    linkUrl: "https://www.dominos.com",
    ctaLabel: "Ordenar Ahora"
  },
  {
    id: "ad-adidas",
    headline: "Adidas Ultraboost 5X: Estilo & Rendimiento",
    body: "Inspiradas en el diseño urbano para creadores digitales. Disfruta de 20% OFF en tu primera compra.",
    icon: "👟",
    brandName: "Adidas",
    linkUrl: "https://www.adidas.com",
    ctaLabel: "Ver Colección"
  },
  {
    id: "ad-nike",
    headline: "Nike Air Jordan 1 Retro",
    body: "El ícono que transformó el streetwear. Descubre ediciones limitadas y lanzamientos exclusivos.",
    icon: "✔️",
    brandName: "Nike",
    linkUrl: "https://www.nike.com",
    ctaLabel: "Explorar Nike"
  },
  {
    id: "ad-spotify",
    headline: "Spotify Premium: 3 Meses Gratis",
    body: "Escucha tu música y podcasts sin anuncios, en alta fidelidad y modo offline sin límites.",
    icon: "🎵",
    brandName: "Spotify",
    linkUrl: "https://www.spotify.com",
    ctaLabel: "Obtener Premium"
  }
];

function toAdDTO(a: BackendAd): AdDTO {
  return {
    id: a.id,
    headline: a.headline || a.nombre,
    body: a.body || '',
    icon: a.imageUrl || '📢',
    linkUrl: a.linkUrl || '#',
    ctaLabel: a.ctaLabel || 'Ver más',
  }
}

export async function getActiveAdsAction(placement: 'FEED' | 'SIDEBAR' | 'BOTH' = 'BOTH'): Promise<{ success: boolean; data: AdDTO[] }> {
  try {
    const res: BackendAd[] | null = await fetchAPI(`/api/business/ads-campaigns/active?placement=${placement}`)
    if (res && res.length > 0) {
      return { success: true, data: res.map(toAdDTO) }
    }
  } catch (error) {
    console.error('Error al obtener anuncios:', error)
  }
  return { success: true, data: REAL_BRAND_ADS }
}

export async function recordAdImpressionAction(adId: string): Promise<void> {
  try {
    await fetchAPI(`/api/business/ads-campaigns/${adId}/impression`, { method: 'POST' })
  } catch (error) {
    console.error('Error al registrar impresión de anuncio:', error)
  }
}
