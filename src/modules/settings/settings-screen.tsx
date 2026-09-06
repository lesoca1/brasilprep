'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/layout/providers';
import { PageHeading, Panel, Button } from '@/components/ui/primitives';
export function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <PageHeading
        eyebrow="PREFERÊNCIAS"
        title="Configurações"
        description="Ajuste seu espaço de estudo."
      />
      <div className="stack">
        <Panel title="Aparência">
          <div className="settings-row">
            <div>
              <h3>Tema da interface</h3>
              <p className="muted">
                A preferência fica salva neste navegador, quando permitido.
              </p>
            </div>
            <div className="theme-buttons" role="group" aria-label="Tema">
              <Button
                aria-pressed={theme === 'light'}
                onClick={() => setTheme('light')}
              >
                <Sun size={16} />
                Claro
              </Button>
              <Button
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme('dark')}
              >
                <Moon size={16} />
                Escuro
              </Button>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <h3>Idioma</h3>
              <p className="muted">Português do Brasil</p>
            </div>
            <span className="tag">Inglês em fase futura</span>
          </div>
        </Panel>
        <Panel title="Perfil de demonstração">
          <div className="settings-row">
            <div>
              <h3>Leonardo</h3>
              <p className="muted">
                Este é um perfil de exemplo. Nenhuma conta foi criada.
              </p>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <h3>Conta e privacidade</h3>
              <p className="muted">
                Login, dados pessoais e preferências de conta serão
                implementados em uma próxima fase.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
