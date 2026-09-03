import { NextRequest, NextResponse } from 'next/server';
import { hasValidSession } from '@/lib/session';

export interface FeedPost {
  id: string | number;
  title: string;
  description?: string;
  author: string;
  handle: string;
  avatar?: string;
  avatar_url?: string;
  discipline?: string;
  media_type: 'image' | 'video' | 'audio' | 'text';
  media_url?: string;
  thumbnail_url?: string;
  audio_url?: string;
  audio_duration?: string;
  video_url?: string;
  likes: number;
  comments: number;
  shares: number;
  liked_by?: string[];
  comments_list?: { id: string; author: string; handle: string; text: string; time: string }[];
  tags: string[];
  created_at: string;
}

// Semilla de publicaciones multimedia ricas de alta calidad para producción y desarrollo
const INITIAL_POSTS: FeedPost[] = [
  {
    id: 101,
    title: 'Neon Odyssey — Arte Conceptual 3D en Blender & Unreal Engine',
    description: 'Explorando iluminación volumétrica y estética synthwave para el nuevo proyecto de entorno cyberpunk. Modelado 100% procedural.',
    author: 'Daniel Artesano',
    handle: '@danielarte',
    avatar: 'DA',
    discipline: 'Arte 3D & VFX',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    likes: 428,
    comments: 34,
    shares: 19,
    liked_by: [],
    tags: ['#Arte3D', '#Cyberpunk', '#Blender', '#UnrealEngine'],
    created_at: 'Hace 15 min',
    comments_list: [
      { id: 'c1', author: 'Elena Vega', handle: '@elenavega', text: '¡La iluminación de neón quedó brutal! 🔥', time: 'Hace 10 min' },
      { id: 'c2', author: 'Carlos Dev', handle: '@carlos_dev', text: '¿Qué render engine usaste? Los reflejos se ven increíbles.', time: 'Hace 5 min' }
    ]
  },
  {
    id: 102,
    title: 'Midnight Reverie — Pista Lo-Fi Synth & Ambient (Master Final)',
    description: 'Composición musical producida en Ableton Live con sintetizadores analógicos Moog y Prophet 6. ¡Escucha con auriculares!',
    author: 'Sofia Synth',
    handle: '@sofiasynth',
    avatar: 'SS',
    discipline: 'Producción Musical',
    media_type: 'audio',
    media_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    audio_duration: '3:45',
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    likes: 612,
    comments: 52,
    shares: 41,
    liked_by: [],
    tags: ['#Musica', '#LoFi', '#Synthwave', '#Ableton'],
    created_at: 'Hace 45 min',
    comments_list: [
      { id: 'c3', author: 'Daniel Artesano', handle: '@danielarte', text: 'Ese bajo analógico suena demasiado cálido ✨', time: 'Hace 20 min' }
    ]
  },
  {
    id: 103,
    title: 'Reel de Animación: Cybernetic Samurai Showcase 2026',
    description: 'Animación de combate estilizada en 60 FPS con shaders personalizados en cel-shading.',
    author: 'Marcus Vance',
    handle: '@marcus_vfx',
    avatar: 'MV',
    discipline: 'Animación & Motion',
    media_type: 'video',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    likes: 890,
    comments: 76,
    shares: 88,
    liked_by: [],
    tags: ['#MotionGraphics', '#Animacion', '#CelShading', '#VFX'],
    created_at: 'Hace 2 horas',
    comments_list: []
  },
  {
    id: 104,
    title: 'Guía de Arquitectura de Sistemas React 19 & Next.js 16 para Artistas',
    description: 'Por qué la Creator Economy necesita plataformas descentralizadas y justas: un desglose sobre algoritmos éticos y propiedad intelectual.',
    author: 'Elena Vega',
    handle: '@elenavega',
    avatar: 'EV',
    discipline: 'Diseño UX & Tech',
    media_type: 'text',
    likes: 315,
    comments: 18,
    shares: 25,
    liked_by: [],
    tags: ['#CreatorEconomy', '#OpenSource', '#UXDesign', '#Tech'],
    created_at: 'Hace 4 horas',
    comments_list: []
  }
];

declare global {
  var __ZENTRY_GLOBAL_POSTS__: FeedPost[] | undefined;
}

if (!global.__ZENTRY_GLOBAL_POSTS__) {
  global.__ZENTRY_GLOBAL_POSTS__ = [...INITIAL_POSTS];
}

const postsStore = global.__ZENTRY_GLOBAL_POSTS__;

// GET: Obtener posts del feed
export async function GET() {
  return NextResponse.json({
    success: true,
    data: postsStore,
    total: postsStore.length
  });
}

// POST: Crear nuevo post multimedia
export async function POST(req: NextRequest) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      author,
      handle,
      avatar,
      avatar_url,
      discipline,
      media_type,
      media_url,
      thumbnail_url,
      audio_url,
      audio_duration,
      video_url,
      tags
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'El título es obligatorio' }, { status: 400 });
    }

    const newPost: FeedPost = {
      id: Date.now(),
      title,
      description: description || '',
      author: author || 'Creador Zentry',
      handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : '@creador',
      avatar: avatar || (author ? author.slice(0, 2).toUpperCase() : 'ZE'),
      avatar_url: avatar_url || undefined,
      discipline: discipline || 'Artista Multidisciplinario',
      media_type: media_type || 'text',
      media_url: media_url || undefined,
      thumbnail_url: thumbnail_url || undefined,
      audio_url: audio_url || (media_type === 'audio' ? media_url : undefined),
      audio_duration: audio_duration || '2:30',
      video_url: video_url || (media_type === 'video' ? media_url : undefined),
      likes: 0,
      comments: 0,
      shares: 0,
      liked_by: [],
      comments_list: [],
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['#Zentry', '#Creatividad'],
      created_at: 'Justo ahora'
    };

    postsStore.unshift(newPost);

    return NextResponse.json({ success: true, data: newPost });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}

// PUT: Likes y Comentarios
export async function PUT(req: NextRequest) {
  if (!(await hasValidSession())) {
    return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, postId, username, commentText, authorName } = body;

    const post = postsStore.find(p => String(p.id) === String(postId));
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post no encontrado' }, { status: 404 });
    }

    if (action === 'like' && username) {
      const cleanU = username.replace(/^@/, '').toLowerCase();
      const likedBy = post.liked_by || [];
      const hasLiked = likedBy.includes(cleanU);

      if (hasLiked) {
        post.liked_by = likedBy.filter(u => u !== cleanU);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.liked_by = [...likedBy, cleanU];
        post.likes = post.likes + 1;
      }

      return NextResponse.json({ success: true, isLiked: !hasLiked, likes: post.likes });
    }

    if (action === 'comment' && commentText) {
      const newComment = {
        id: `com_${Date.now()}`,
        author: authorName || username || 'Creador',
        handle: username ? (username.startsWith('@') ? username : `@${username}`) : '@creador',
        text: commentText,
        time: 'Justo ahora'
      };

      post.comments_list = [newComment, ...(post.comments_list || [])];
      post.comments = post.comments_list.length;

      return NextResponse.json({ success: true, comment: newComment, commentsCount: post.comments });
    }

    return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}
