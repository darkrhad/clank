// Which card art to show: the normal fantasy art or the Vietnamese art
// (Vietnamese characters and folklore). Separate from the language, saved
// like it, and switchable in the middle of a game.

import { useSyncExternalStore } from 'react';

export type ArtStyle = 'fantasy' | 'viet';
export const ART_STYLES: ArtStyle[] = ['fantasy', 'viet'];

const KEY = 'artStyle';

function initial(): ArtStyle {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'fantasy' || saved === 'viet') return saved;
  } catch { /* no storage: fall through */ }
  return 'viet';
}

let current: ArtStyle = typeof window === 'undefined' ? 'viet' : initial();
const listeners = new Set<() => void>();

export const getArtStyle = (): ArtStyle => current;

export function setArtStyle(style: ArtStyle) {
  current = style;
  try { localStorage.setItem(KEY, style); } catch { /* ignore */ }
  listeners.forEach((f) => f());
}

function subscribe(f: () => void) {
  listeners.add(f);
  return () => { listeners.delete(f); };
}

// Re-renders the component when the art style changes
export const useArtStyle = (): ArtStyle => useSyncExternalStore(subscribe, getArtStyle, getArtStyle);
