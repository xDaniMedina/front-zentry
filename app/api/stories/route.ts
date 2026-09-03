import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_STORIES_DATA } from '@/lib/stories';
import { UserStoryGroup, StoryItem } from '@/types/stories';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

// Almacen en memoria fallback para persistencia inmediata en frontend
let STORIES_STORE: UserStoryGroup[] = JSON.parse(JSON.stringify(INITIAL_STORIES_DATA));

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // Intentar consultar backend Spring Boot
    const backendUrl = `${BACKEND_URL}/api/core/stories/feed${userId ? `?userId=${userId}` : ''}`;
    const res = await fetch(backendUrl, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const backendGroups = await res.json();
      if (Array.isArray(backendGroups) && backendGroups.length > 0) {
        // Normalizar los items del backend a formato de StoryItem
        const formattedBackendGroups: UserStoryGroup[] = backendGroups.map((g: any) => ({
          id: g.user_id || g.id || `user_${g.username}`,
          user_id: String(g.user_id || ''),
          username: g.username,
          name: g.name || g.username,
          avatar: g.avatar || (g.name ? g.name.substring(0, 2).toUpperCase() : 'ZE'),
          avatar_url: g.avatar_url,
          isUser: Boolean(g.is_user),
          hasUnseen: Boolean(g.has_unseen),
          last_updated: g.last_updated ? 'Reciente' : 'Hace un momento',
          items: Array.isArray(g.items) ? g.items.map((item: any) => ({
            id: String(item.id),
            type: (item.media_type ? item.media_type.toLowerCase() : 'image') as any,
            media_url: item.media_url,
            text_content: item.text_content,
            text_color: item.text_color || '#ffffff',
            background: item.background,
            font_style: item.font_style || 'sans',
            caption: item.caption,
            music: item.music_title ? {
              title: item.music_title,
              artist: item.music_artist || 'Zentry Music',
              url: item.music_url
            } : undefined,
            duration: item.duration || 5000,
            created_at: item.created_at ? 'Reciente' : 'Hace un momento',
            likes: item.likes_count || 0,
            liked: Boolean(item.is_liked)
          })) : []
        }));

        // Combinar creadores destacados con los del backend sin duplicar
        const merged: UserStoryGroup[] = [...formattedBackendGroups];
        for (const sample of INITIAL_STORIES_DATA) {
          if (!merged.some(m => m.username?.toLowerCase() === sample.username?.toLowerCase())) {
            merged.push(sample);
          }
        }

        return NextResponse.json({
          success: true,
          data: merged
        });
      }
    }
  } catch (e) {
    // Si backend no esta disponible, continuar con STORIES_STORE
  }

  return NextResponse.json({
    success: true,
    data: STORIES_STORE
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      username, 
      name, 
      avatar, 
      avatar_url, 
      storyItem 
    } = body;

    if (!username || !storyItem) {
      return NextResponse.json({ success: false, error: 'Datos incompletos' }, { status: 400 });
    }

    const newStoryItem: StoryItem = {
      id: `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: storyItem.type || 'image',
      media_url: storyItem.media_url,
      text_content: storyItem.text_content,
      text_color: storyItem.text_color || '#ffffff',
      background: storyItem.background || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%)',
      font_style: storyItem.font_style || 'sans',
      caption: storyItem.caption,
      music: storyItem.music,
      duration: storyItem.duration || 5000,
      created_at: 'Justo ahora',
      likes: 0,
      liked: false
    };

    // Intentar sincronizar con Backend Spring Boot
    try {
      await fetch(`${BACKEND_URL}/api/core/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId) || 1,
          mediaType: storyItem.type ? storyItem.type.toUpperCase() : 'IMAGE',
          mediaUrl: storyItem.media_url,
          textContent: storyItem.text_content,
          textColor: storyItem.text_color,
          background: storyItem.background,
          fontStyle: storyItem.font_style,
          caption: storyItem.caption,
          musicTitle: storyItem.music?.title,
          musicArtist: storyItem.music?.artist,
          duration: storyItem.duration || 5000
        })
      });
    } catch {}

    const cleanUsername = String(username).replace(/^@/, '');
    const existingIndex = STORIES_STORE.findIndex(
      g => g.username?.toLowerCase() === cleanUsername.toLowerCase() || g.isUser
    );

    if (existingIndex >= 0) {
      const currentGroup = STORIES_STORE[existingIndex];
      STORIES_STORE[existingIndex] = {
        ...currentGroup,
        hasUnseen: true,
        last_updated: 'Justo ahora',
        items: [newStoryItem, ...(currentGroup.items || [])]
      };
    } else {
      const newGroup: UserStoryGroup = {
        id: userId || `user_${cleanUsername}`,
        username: cleanUsername,
        name: name || cleanUsername,
        avatar: avatar || cleanUsername.substring(0, 2).toUpperCase(),
        avatar_url: avatar_url,
        isUser: true,
        hasUnseen: true,
        items: [newStoryItem],
        last_updated: 'Justo ahora'
      };
      STORIES_STORE = [newGroup, ...STORIES_STORE];
    }

    return NextResponse.json({
      success: true,
      data: newStoryItem,
      stories: STORIES_STORE
    });
  } catch (error) {
    console.error('[API /api/stories error]:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, storyId, groupId, liked, userId } = body;

    // Sincronizar accion con backend si es numerico
    if (action === 'like' && storyId && !isNaN(Number(storyId))) {
      try {
        await fetch(`${BACKEND_URL}/api/core/stories/${storyId}/like?userId=${userId || 1}`, {
          method: 'POST'
        });
      } catch {}
    }

    if (action === 'view' && storyId && !isNaN(Number(storyId))) {
      try {
        await fetch(`${BACKEND_URL}/api/core/stories/${storyId}/view?userId=${userId || 1}`, {
          method: 'POST'
        });
      } catch {}
    }

    if (action === 'like' && storyId) {
      STORIES_STORE = STORIES_STORE.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === storyId) {
            const nextLiked = typeof liked === 'boolean' ? liked : !item.liked;
            return {
              ...item,
              liked: nextLiked,
              likes: nextLiked ? item.likes + 1 : Math.max(0, item.likes - 1)
            };
          }
          return item;
        })
      }));
      return NextResponse.json({ success: true });
    }

    if (action === 'view' && groupId) {
      STORIES_STORE = STORIES_STORE.map(group => {
        if (group.id === groupId) {
          return { ...group, hasUnseen: false };
        }
        return group;
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Accion desconocida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al actualizar' }, { status: 500 });
  }
}