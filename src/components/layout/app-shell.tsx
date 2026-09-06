'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
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
} from 'lucide-react';
import { navigation } from '@/lib/navigation';
import { useTheme, useTrack } from './providers';
const icons = {
  overview: LayoutDashboard,
  tracks: Route,
  practice: PencilLine,
  exam: ClipboardList,
  chart: ChartNoAxesCombined,
  questions: BookOpen,
  settings: Settings2,
};
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { exam, setExam } = useTrack();
  const current =
    navigation.find((item) => pathname.startsWith(item.href))?.label ??
    'Visão geral';
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
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
                className={`nav-link ${i === 6 ? 'nav-settings' : ''}`}
              >
                <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <p className="small">Ambiente de demonstração</p>
          <p className="muted small">Fundação · Fase 1</p>
          <div className="profile">
            <span className="avatar">L</span>
            <div>
              <strong>Leonardo</strong>
              <span className="muted small">Perfil de exemplo</span>
            </div>
          </div>
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
            <label className="track-selector">
              <span className="sr-only">Trilha ativa</span>
              <select
                value={exam}
                onChange={(e) =>
                  setExam(e.target.value === 'unicamp' ? 'unicamp' : 'fuvest')
                }
              >
                <option value="fuvest">FUVEST</option>
                <option value="unicamp">UNICAMP</option>
              </select>
            </label>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <div className="demo-banner">
          <span className="demo-label">DEMONSTRAÇÃO</span>
          <span>Explore a interface com dados fictícios.</span>
        </div>
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
