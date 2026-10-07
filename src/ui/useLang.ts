import { useSyncExternalStore } from 'react';
import { getLang, subscribeLang, type Lang } from '../i18n/lang';

// Re-renders the component when the language changes
export const useLang = (): Lang => useSyncExternalStore(subscribeLang, getLang, getLang);
