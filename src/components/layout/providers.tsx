'use client';
import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { demoTracks, type ExamId } from '@/data/demo';
const TrackContext = createContext<{
  exam: ExamId;
  setExam: (exam: ExamId) => void;
} | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [exam, setExam] = useState<ExamId>('fuvest');
  return (
    <TrackContext.Provider value={{ exam, setExam }}>
      {children}
    </TrackContext.Provider>
  );
}
export function useTrack() {
  const ctx = useContext(TrackContext);
  if (!ctx) throw new Error('Track provider missing');
  return { ...ctx, track: demoTracks[ctx.exam] };
}
function subscribeTheme(callback: () => void) {
  window.addEventListener('brasilprep-theme', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('brasilprep-theme', callback);
    window.removeEventListener('storage', callback);
  };
}
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.dataset.theme || 'light',
    () => 'light',
  );
  function setTheme(value: 'light' | 'dark') {
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem('brasilprep-theme', value);
    } catch {
      /* Preferences remain usable without storage. */
    }
    window.dispatchEvent(new Event('brasilprep-theme'));
  }
  return { theme, setTheme };
}
