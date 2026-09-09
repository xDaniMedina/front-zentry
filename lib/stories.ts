import { StoryFontStyle } from '@/types/stories';

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
