'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Route,
  PencilLine,
  ClipboardList,
  ChartNoAxesCombined,
  BookOpen,
  Settings2,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { navigation } from '@/lib/navigation';
import { useTheme, useApp } from './providers';
import { Button, EmptyState } from '@/components/ui/primitives';
const icons = {
  overview: LayoutDashboard,
  tracks: Route,
  practice: PencilLine,
  exam: ClipboardList,
  chart: ChartNoAxesCombined,
  questions: BookOpen,
  settings: Settings2,
};
const publicPaths = [
  '/entrar',
  '/cadastro',
  '/confirmar',
  '/recuperar-senha',
  '/nova-senha',
];
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname().replace(/\/$/, '') || '/';
  const router = useRouter();
  const app = useApp();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isPublic = publicPaths.includes(pathname);
  const onboarding = pathname === '/onboarding';
  const needsOnboarding =
    app.status === 'ready' &&
    (!app.workspace?.profile.onboarding_completed_at ||
      !app.workspace.trilhas.length);
  useEffect(() => {
    if (app.status === 'anonymous' && !isPublic) router.replace('/entrar');
    else if (
      needsOnboarding &&
      !isPublic &&
      !onboarding &&
      pathname !== '/configuracoes'
    )
      router.replace('/onboarding');
  }, [app.status, isPublic, needsOnboarding, onboarding, pathname, router]);
  if (app.status === 'loading')
    return (
      <div className="auth-layout" role="status">
        <p>Carregando sua conta...</p>
      </div>
    );
  if (app.status === 'unconfigured')
    return (
      <div className="auth-layout">
        <Link className="brand" href="/">
          BrasilPrep
        </Link>
        <EmptyState
          title="Conexão ainda não configurada"
          description="O ambiente precisa de uma conexão com o banco para permitir cadastro e login. Nenhum dado demonstrativo será usado no lugar da sua conta."
        />
        <p className="muted small">
          Para desenvolvimento, siga o guia de configuração no README do
          repositório.
        </p>
      </div>
    );
  if (app.status === 'error')
    return (
      <div className="auth-layout">
        <EmptyState
          title="Não foi possível carregar sua conta"
          description={app.error ?? 'Tente novamente.'}
        />
        <div className="theme-buttons">
          <Button onClick={() => void app.refresh()}>Tentar novamente</Button>
          <Button
            onClick={() =>
              void app
                .signOut()
                .catch(() =>
                  setError('Não foi possível sair. Tente novamente.'),
                )
            }
          >
            Sair
          </Button>
        </div>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  if (isPublic)
    return (
      <div className="auth-layout">
        <Link className="brand" href="/dashboard">
          BrasilPrep
        </Link>
        {children}
      </div>
    );
  if (
    app.status === 'anonymous' ||
    (needsOnboarding && !onboarding && pathname !== '/configuracoes')
  )
    return (
      <p className="auth-layout" role="status">
        Redirecionando...
      </p>
    );
  async function switchTrack(id: string) {
    setBusy(true);
    setError('');
    try {
      await app.services?.workspace.switchTrilha(id);
      await app.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível trocar de trilha.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await app.signOut();
      router.replace('/entrar');
    } catch {
      setError('Não foi possível sair. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  const current = onboarding
    ? 'Seu objetivo'
    : (navigation.find((item) => pathname.startsWith(item.href))?.label ??
      'Visão geral');
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <aside
        className={`sidebar ${mobileOpen ? 'is-open' : ''}`}
        aria-label="Menu principal"
      >
        <Link
          href="/dashboard"
          className="brand"
          onClick={() => setMobileOpen(false)}
        >
          <span className="brand-mark" aria-hidden="true">
            b<span>.</span>
          </span>
          <span>BrasilPrep</span>
        </Link>
        <p className="sidebar-label">SEU ESPAÇO DE ESTUDO</p>
        <nav aria-label="Navegação principal">
          {navigation.map(({ href, label, icon }, i) => {
            const Icon = icons[icon];
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={pathname === href ? 'page' : undefined}
                className={`nav-link ${i === 6 ? 'nav-settings' : ''}`}
              >
                <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <span className="avatar">
              {app.workspace?.profile.display_name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{app.workspace?.profile.display_name}</strong>
              <span className="muted small">Minha conta</span>
            </div>
          </div>
          <button
            className="text-link signout"
            onClick={() => void logout()}
            disabled={busy}
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="muted desktop-only">Meu espaço</span>
            <ChevronRight
              className="desktop-only"
              size={14}
              aria-hidden="true"
            />
            <span>{current}</span>
          </div>
          <div className="topbar-actions">
            {!!app.workspace?.trilhas.length && (
              <label className="track-selector">
                <span className="sr-only">Trilha ativa</span>
                <select
                  value={app.workspace.profile.active_trilha_id ?? ''}
                  disabled={busy}
                  onChange={(e) => void switchTrack(e.target.value)}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {app.workspace.trilhas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {app.workspace?.catalog.exams.find(
                        (e) => e.id === t.exam_id,
                      )?.name ?? t.exam_id}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              className="icon-button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label="Sair da conta"
              onClick={() => void logout()}
              disabled={busy}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          <span>BrasilPrep</span>
          <span>Preparação com critério.</span>
        </footer>
      </div>
    </div>
  );
}
