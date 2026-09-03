export type StoryType = 'image' | 'video' | 'text';

export type StoryFontStyle = 'sans' | 'serif' | 'mono' | 'handwriting' | 'impact';

export interface StoryMusic {
  title: string;
  artist: string;
  url?: string;
}

export interface StoryItem {
  id: string;
  type: StoryType;
  media_url?: string;
  text_content?: string;
  text_color?: string;
  background?: string; // CSS background / gradient
  font_style?: StoryFontStyle;
  caption?: string;
  music?: StoryMusic;
  link_url?: string;
  duration: number; // in milliseconds, e.g. 5000
  created_at: string;
  likes: number;
  liked?: boolean;
}

export interface UserStoryGroup {
  id: string | number;
  user_id?: string;
  username: string;
  name: string;
  avatar: string;
  avatar_url?: string;
  isUser: boolean;
  hasUnseen: boolean;
  items: StoryItem[];
  last_updated: string;
}

export interface StoryReaction {
  story_id: string;
  emoji: string;
  username: string;
  created_at: string;
}
