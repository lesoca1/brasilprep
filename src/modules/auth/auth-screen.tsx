'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useApp } from '@/components/layout/providers';
import { Button } from '@/components/ui/primitives';
type Mode = 'login' | 'signup' | 'recovery' | 'password';
export function AuthScreen({ mode }: { mode: Mode }) {
  const app = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const titles = {
    login: 'Entre no seu espaço',
    signup: 'Crie sua conta',
    recovery: 'Recupere sua senha',
    password: 'Defina uma nova senha',
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!app.services) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const result = await app.services.auth.signUp(
          email.trim(),
          password,
          name.trim(),
          new URL('/confirmar/', window.location.origin).href,
        );
        setPassword('');
        if (result.needsConfirmation) {
          setMessage(
            'Confira seu e-mail para confirmar o cadastro. Se já tiver uma conta, entre ou recupere sua senha.',
          );
          return;
        }
        await app.refresh();
        router.replace('/onboarding');
      } else if (mode === 'login') {
        await app.services.auth.signIn(email.trim(), password);
        await app.refresh();
        router.replace('/dashboard');
      } else if (mode === 'recovery') {
        await app.services.auth.resetPassword(
          email.trim(),
          new URL('/nova-senha/', window.location.origin).href,
        );
        setMessage(
          'Se houver uma conta para este e-mail, você receberá as instruções para recuperar a senha.',
        );
      } else {
        await app.services.auth.updatePassword(password);
        setPassword('');
        setMessage('Senha atualizada. Você já pode voltar ao seu painel.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }
  if (app.status === 'ready' && (mode === 'login' || mode === 'signup'))
    return (
      <section className="auth-card">
        <h1>Você já está conectado</h1>
        <Link className="button primary" href="/dashboard">
          Ir ao painel
        </Link>
      </section>
    );
  if (mode === 'password' && app.status !== 'ready')
    return (
      <section className="auth-card">
        <h1>Abra o link do e-mail</h1>
        <p className="muted">Solicite um novo link se ele tiver expirado.</p>
        <Link href="/recuperar-senha" className="button">
          Recuperar senha
        </Link>
      </section>
    );
  return (
    <section className="auth-card">
      <p className="eyebrow">BRASILPREP</p>
      <h1>{titles[mode]}</h1>
      {mode === 'signup' && (
        <p className="muted">
          Depois do cadastro, escolha seus vestibulares e objetivos.
        </p>
      )}
      <form onSubmit={submit} className="stack">
        {mode === 'signup' && (
          <label className="field">
            Como você quer ser chamado?
            <input
              required
              minLength={1}
              maxLength={80}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}
        {mode !== 'password' && (
          <label className="field">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {mode !== 'recovery' && (
          <label className="field">
            Senha
            <input
              type="password"
              required
              minLength={mode === 'login' ? 1 : 12}
              maxLength={128}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode !== 'login' && (
              <span className="field-hint">Pelo menos 12 caracteres.</span>
            )}
          </label>
        )}
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        <Button type="submit" className="primary" disabled={busy}>
          {busy
            ? 'Aguarde...'
            : mode === 'login'
              ? 'Entrar'
              : mode === 'signup'
                ? 'Criar conta'
                : mode === 'recovery'
                  ? 'Enviar instruções'
                  : 'Salvar senha'}
        </Button>
      </form>
      <div className="auth-links">
        {mode === 'login' ? (
          <>
            <Link href="/cadastro">Criar uma conta</Link>
            <Link href="/recuperar-senha">Esqueci a senha</Link>
          </>
        ) : (
          <Link href={mode === 'password' ? '/dashboard' : '/entrar'}>
            {mode === 'password' ? 'Voltar ao painel' : 'Voltar para entrar'}
          </Link>
        )}
      </div>
    </section>
  );
}
export function ConfirmationScreen() {
  const app = useApp();
  return (
    <section className="auth-card">
      <h1>
        {app.status === 'ready' ? 'E-mail confirmado' : 'Confirme seu e-mail'}
      </h1>
      <p className="muted">
        {app.status === 'ready'
          ? 'Escolha seus vestibulares para começar.'
          : 'Se o link expirou ou foi aberto em outro contexto, tente entrar. Solicite uma recuperação de senha caso precise.'}
      </p>
      <Link
        className="button primary"
        href={app.status === 'ready' ? '/onboarding' : '/entrar'}
      >
        {app.status === 'ready' ? 'Escolher vestibulares' : 'Entrar'}
      </Link>
    </section>
  );
}
