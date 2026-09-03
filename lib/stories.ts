import { StoryItem, UserStoryGroup, StoryFontStyle } from '@/types/stories';

export const STORY_GRADIENTS = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%)',
    textColor: '#38bdf8',
  },
  {
    id: 'sunset',
    name: 'Sunset Synth',
    gradient: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #f43f5e 100%)',
    textColor: '#ffffff',
  },
  {
    id: 'matrix',
    name: 'Matrix Emerald',
    gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #059669 100%)',
    textColor: '#6ee7b7',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    gradient: 'linear-gradient(135deg, #311042 0%, #581c87 50%, #7e22ce 100%)',
    textColor: '#f5d0fe',
  },
  {
    id: 'amber',
    name: 'Solar Flare',
    gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #d97706 100%)',
    textColor: '#fef08a',
  },
  {
    id: 'dark',
    name: 'Dark Obsidian',
    gradient: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)',
    textColor: '#ffffff',
  }
];

export const STORY_FONTS: { id: StoryFontStyle; name: string; className: string }[] = [
  { id: 'sans', name: 'Modern Sans', className: 'font-sans font-bold' },
  { id: 'serif', name: 'Editorial Serif', className: 'font-serif italic font-semibold' },
  { id: 'mono', name: 'Cyber Monospace', className: 'font-mono uppercase tracking-wider' },
  { id: 'impact', name: 'Bold Impact', className: 'font-black tracking-tight uppercase' },
  { id: 'handwriting', name: 'Creative Flow', className: 'font-sans italic font-medium' }
];

export const INITIAL_STORIES_DATA: UserStoryGroup[] = [
  {
    id: 'creator_daniel',
    username: 'danielarte',
    name: 'Daniel Artesano',
    avatar: 'DA',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isUser: false,
    hasUnseen: true,
    last_updated: 'Hace 15 min',
    items: [
      {
        id: 's_da_1',
        type: 'image',
        media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
        caption: 'Explorando nueva iluminación volumétrica en Blender 4.3 🌆',
        music: {
          title: 'Neon Tokyo Pulse',
          artist: 'Kavinsky Vibe'
        },
        duration: 5000,
        created_at: 'Hace 15 min',
        likes: 128,
        liked: false
      },
      {
        id: 's_da_2',
        type: 'text',
        text_content: '«El diseño no es sólo lo que se ve y se siente. El diseño es cómo funciona.»\n\n— Mañana revelamos el nuevo módulo de Zentry 🚀',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%)',
        text_color: '#38bdf8',
        font_style: 'impact',
        music: {
          title: 'Cyber Dreams',
          artist: 'Zentry Sound'
        },
        duration: 5000,
        created_at: 'Hace 10 min',
        likes: 94,
        liked: false
      }
    ]
  },
  {
    id: 'creator_sofia',
    username: 'sofiasynth',
    name: 'Sofia Synth',
    avatar: 'SS',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    isUser: false,
    hasUnseen: true,
    last_updated: 'Hace 30 min',
    items: [
      {
        id: 's_ss_1',
        type: 'image',
        media_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1080&q=85',
        caption: 'Sesión nocturna grabando sintetizadores analógicos 🎹✨',
        music: {
          title: 'Midnight Reverie',
          artist: 'Sofia Synth'
        },
        duration: 5000,
        created_at: 'Hace 30 min',
        likes: 215,
        liked: true
      },
      {
        id: 's_ss_2',
        type: 'text',
        text_content: '¿Prefieren que el próximo EP tenga más influencias Lo-Fi o Synthwave oscuro? 🎧 Dejen su voto en DM!',
        background: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #f43f5e 100%)',
        text_color: '#ffffff',
        font_style: 'serif',
        duration: 5000,
        created_at: 'Hace 22 min',
        likes: 180,
        liked: false
      }
    ]
  },
  {
    id: 'creator_lucas',
    username: 'lucas_ui',
    name: 'Lucas Rossi',
    avatar: 'LR',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    isUser: false,
    hasUnseen: true,
    last_updated: 'Hace 1 hora',
    items: [
      {
        id: 's_lr_1',
        type: 'image',
        media_url: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?auto=format&fit=crop&w=1080&q=85',
        caption: 'Micro-interacciones con Framer Motion en modo Zentry Dark 🎨',
        duration: 5000,
        created_at: 'Hace 1 hora',
        likes: 87,
        liked: false
      }
    ]
  },
  {
    id: 'creator_elena',
    username: 'elenavega',
    name: 'Elena Vega',
    avatar: 'EV',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    isUser: false,
    hasUnseen: true,
    last_updated: 'Hace 2 horas',
    items: [
      {
        id: 's_ev_1',
        type: 'image',
        media_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1080&q=85',
        caption: 'Texturas abstractas en 4K listas para el marketplace de Zentry!',
        music: {
          title: 'Ethereal Waves',
          artist: 'SoundLab'
        },
        duration: 5000,
        created_at: 'Hace 2 horas',
        likes: 340,
        liked: false
      }
    ]
  },
  {
    id: 'creator_marcos',
    username: 'marcos_code',
    name: 'Marcos Dev',
    avatar: 'MD',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isUser: false,
    hasUnseen: false,
    last_updated: 'Hace 4 horas',
    items: [
      {
        id: 's_md_1',
        type: 'text',
        text_content: 'Optimizando el pipeline de renderizado WebGL para 120 FPS constantes ⚡💻',
        background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #059669 100%)',
        text_color: '#6ee7b7',
        font_style: 'mono',
        duration: 5000,
        created_at: 'Hace 4 horas',
        likes: 156,
        liked: false
      }
    ]
  }
];

const STORIES_STORAGE_KEY = 'zentry_user_stories_v1';
const VIEWED_STORIES_KEY = 'zentry_viewed_stories_v1';

export function getLocalUserStories(): StoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalUserStory(story: StoryItem): StoryItem[] {
  if (typeof window === 'undefined') return [story];
  try {
    const current = getLocalUserStories();
    const updated = [story, ...current];
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [story];
  }
}

export function getViewedStoryIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VIEWED_STORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markStoryGroupViewed(groupId: string | number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getViewedStoryIds();
    const strId = String(groupId);
    if (!current.includes(strId)) {
      localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify([...current, strId]));
    }
  } catch {}
}
