'use client';
import { useState } from 'react';
import { useApp, useTheme } from '@/components/layout/providers';
import { PageHeading, Panel, Button } from '@/components/ui/primitives';
export function SettingsScreen() {
  const app = useApp();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(app.workspace?.profile.display_name ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  return (
    <>
      <PageHeading eyebrow="PREFERÊNCIAS" title="Configurações" />
      <div className="stack">
        <Panel title="Seu perfil">
          <form
            className="form-content"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setMessage('');
              setError('');
              try {
                await app.services?.workspace.updateProfile(name);
                await app.refresh();
                setMessage('Nome atualizado.');
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : 'Não foi possível salvar.',
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              Nome
              <input
                value={name}
                required
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <p className="muted">E-mail: {app.user?.email}</p>
            {message && <p role="status">{message}</p>}
            {error && <p role="alert">{error}</p>}
            <Button type="submit" disabled={busy || !name.trim()}>
              {busy ? 'Salvando...' : 'Salvar nome'}
            </Button>
          </form>
        </Panel>
        <Panel title="Aparência">
          <div className="settings-row">
            <div>
              <h3>Tema da interface</h3>
              <p className="muted">Preferência salva neste navegador.</p>
            </div>
            <div className="theme-buttons" role="group" aria-label="Tema">
              <Button
                aria-pressed={theme === 'light'}
                onClick={() => setTheme('light')}
              >
                Claro
              </Button>
              <Button
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme('dark')}
              >
                Escuro
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
