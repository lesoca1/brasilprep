'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { Identity, Workspace } from '@/domain/models';
import { describeTrilha } from '@/domain/models';
import type { AppServices } from '@/data-access/contracts';
import { getServices } from '@/data-access/supabase';

type State = {
  status: 'loading' | 'unconfigured' | 'anonymous' | 'ready' | 'error';
  user: Identity | null;
  workspace: Workspace | null;
  error: string | null;
};
type Context = State & {
  services: AppServices | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};
const AppContext = createContext<Context | null>(null);
export function Providers({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    status: 'loading',
    user: null,
    workspace: null,
    error: null,
  });
  const serviceRef = useRef<AppServices | null>(null);
  const [services, setServices] = useState<AppServices | null>(null);
  const requestRef = useRef(0);
  const invalidate = useCallback(() => {
    requestRef.current++;
  }, []);
  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    try {
      const services = serviceRef.current ?? getServices();
      serviceRef.current = services;
      setServices(services);
      if (!services) {
        setState({
          status: 'unconfigured',
          user: null,
          workspace: null,
          error: null,
        });
        return;
      }
      const user = await services.auth.identity();
      if (request !== requestRef.current) return;
      if (!user) {
        setState({
          status: 'anonymous',
          user: null,
          workspace: null,
          error: null,
        });
        return;
      }
      // Do not leave another account's records on screen while changing identity.
      setState((previous) =>
        previous.user?.id === user.id
          ? previous
          : { status: 'loading', user, workspace: null, error: null },
      );
      const workspace = await services.workspace.load();
      if (request !== requestRef.current) return;
      setState({ status: 'ready', user, workspace, error: null });
    } catch (error) {
      if (request === requestRef.current)
        setState({
          status: 'error',
          user: null,
          workspace: null,
          error:
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar sua conta.',
        });
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        serviceRef.current = getServices();
        unsubscribe = serviceRef.current?.auth.subscribe(() => {
          if (!cancelled) void refresh();
        });
      } catch {
        /* refresh reports configuration failures. */
      }
      void refresh();
    });
    return () => {
      cancelled = true;
      invalidate();
      unsubscribe?.();
    };
  }, [refresh, invalidate]);
  async function signOut() {
    await serviceRef.current?.auth.signOut();
    requestRef.current++;
    setState({ status: 'anonymous', user: null, workspace: null, error: null });
  }
  return (
    <AppContext.Provider value={{ ...state, services, refresh, signOut }}>
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('App provider missing');
  return ctx;
}
export function useActiveTrilha() {
  const { workspace } = useApp();
  if (!workspace) return null;
  const row = workspace.trilhas.find(
    (t) => t.id === workspace.profile.active_trilha_id,
  );
  return row ? describeTrilha(row, workspace.catalog) : null;
}
function subscribeTheme(callback: () => void) {
  const storage = (event: StorageEvent) => {
    if (
      event.key === 'brasilprep-theme' &&
      (event.newValue === 'dark' || event.newValue === 'light')
    )
      document.documentElement.dataset.theme = event.newValue;
    callback();
  };
  window.addEventListener('brasilprep-theme', callback);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener('brasilprep-theme', callback);
    window.removeEventListener('storage', storage);
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
    } catch {}
    window.dispatchEvent(new Event('brasilprep-theme'));
  }
  return { theme, setTheme };
}
