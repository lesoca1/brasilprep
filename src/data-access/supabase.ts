import { createPracticeRepository } from './practice';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { AppServices } from './contracts';

let services: AppServices | null = null;
export function getServices(): AppServices | null {
  if (services) return services;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  if (key.startsWith('sb_secret_'))
    throw new Error('Use apenas a chave pública do projeto.');
  const client = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  services = createServices(client);
  return services;
}
function check(error: { message: string; code?: string } | null) {
  if (!error) return;
  const messages: Record<string, string> = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
    over_email_send_rate_limit:
      'Aguarde alguns minutos antes de solicitar outro e-mail.',
    weak_password: 'Use uma senha com pelo menos 12 caracteres.',
    user_already_exists:
      'Não foi possível cadastrar. Tente entrar ou recuperar sua senha.',
    signup_disabled: 'O cadastro está temporariamente indisponível.',
    '42501': 'Você não tem acesso a esta trilha.',
    '22023':
      'O objetivo escolhido não está disponível. Atualize a página e tente novamente.',
    '23505': 'Você já tem uma trilha para este vestibular.',
  };
  throw new Error(
    messages[error.code ?? ''] ??
      'Não foi possível concluir. Verifique sua conexão e tente novamente.',
  );
}
export function createServices(client: SupabaseClient<Database>): AppServices {
  return {
    practice: createPracticeRepository(client),
    questions: {
      async isEditor() {
        const result = await client
          .from('question_editors')
          .select('user_id')
          .limit(1);
        if (result.error)
          throw new Error(
            'Não foi possível verificar o acesso ao acervo. Verifique se a migration da Fase 3 foi aplicada.',
          );
        return Boolean(result.data?.length);
      },
      async list(filter) {
        let query = client.from('questions').select('*', { count: 'exact' });
        if (filter.exam) query = query.eq('exam_id', filter.exam);
        if (filter.kind === 'synthetic' || filter.kind === 'official')
          query = query.eq('kind', filter.kind);
        if (
          filter.difficulty === 'easy' ||
          filter.difficulty === 'medium' ||
          filter.difficulty === 'hard'
        )
          query = query.eq('difficulty', filter.difficulty);
        const result = await query
          .order('created_at', { ascending: false })
          .order('id')
          .range(filter.page * 20, filter.page * 20 + 19);
        if (result.error)
          throw new Error(
            'Não foi possível carregar o acervo. Tente novamente.',
          );
        return { rows: result.data ?? [], count: result.count ?? 0 };
      },
      async importBatch(questions) {
        const result = await client.rpc('import_questions', {
          batch: questions,
        });
        if (result.error) {
          if (result.error.code === '23505')
            throw new Error(
              'Lote rejeitado: enunciado duplicado no mesmo vestibular. Nenhuma questão foi adicionada.',
            );
          if (result.error.code === '23503')
            throw new Error('Lote rejeitado: vestibular não cadastrado.');
          if (result.error.code === '42501')
            throw new Error('Acesso de editor necessário.');
          if (result.error.code === '22023')
            throw new Error(
              `Lote rejeitado: ${result.error.message}. Nenhuma alteração foi salva.`,
            );
          throw new Error(
            'Importação não confirmada. Verifique a conexão e reenvie o mesmo arquivo; IDs idênticos não serão duplicados.',
          );
        }
        return result.data ?? 0;
      },
    },
    auth: {
      async identity() {
        const { data, error } = await client.auth.getUser();
        if (error?.name === 'AuthSessionMissingError') return null;
        check(error);
        return data.user ? { id: data.user.id, email: data.user.email } : null;
      },
      subscribe(listener) {
        const { data } = client.auth.onAuthStateChange(() => {
          setTimeout(listener, 0);
        });
        return () => data.subscription.unsubscribe();
      },
      async signUp(email, password, name, redirectTo) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: redirectTo,
          },
        });
        check(error);
        return { needsConfirmation: !data.session };
      },
      async signIn(email, password) {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        check(error);
      },
      async signOut() {
        const { error } = await client.auth.signOut({ scope: 'local' });
        check(error);
      },
      async resetPassword(email, redirectTo) {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        check(error);
      },
      async updatePassword(password) {
        const { error } = await client.auth.updateUser({ password });
        check(error);
      },
    },
    workspace: {
      async load() {
        const [profile, trilhas, exams, institutions, courses, targets] =
          await Promise.all([
            client.from('profiles').select('*').single(),
            client.from('trilhas').select('*').order('created_at'),
            client.from('exams').select('*').order('name'),
            client.from('institutions').select('*').order('name'),
            client.from('courses').select('*').order('name'),
            client
              .from('admission_targets')
              .select('*')
              .order('admission_year', { ascending: false }),
          ]);
        for (const result of [
          profile,
          trilhas,
          exams,
          institutions,
          courses,
          targets,
        ])
          check(result.error);
        if (!profile.data)
          throw new Error('Perfil indisponível. Tente entrar novamente.');
        return {
          profile: profile.data,
          trilhas: trilhas.data ?? [],
          catalog: {
            exams: exams.data ?? [],
            institutions: institutions.data ?? [],
            courses: courses.data ?? [],
            targets: targets.data ?? [],
          },
        };
      },
      async confirmTargets(targetIds) {
        const { error } = await client.rpc('confirm_trilhas', {
          target_ids: targetIds,
        });
        check(error);
      },
      async switchTrilha(id) {
        const { error } = await client.rpc('switch_trilha', { trilha_id: id });
        check(error);
      },
      async changeTarget(id, targetId) {
        const { error } = await client.rpc('change_trilha_target', {
          trilha_id: id,
          new_target_id: targetId,
        });
        check(error);
      },
      async removeTrilha(id) {
        const { error } = await client.rpc('remove_trilha', { trilha_id: id });
        check(error);
      },
      async updateProfile(name) {
        const { data, error } = await client.auth.getUser();
        check(error);
        if (!data.user) throw new Error('Entre para continuar.');
        const result = await client
          .from('profiles')
          .update({ display_name: name.trim() })
          .eq('id', data.user.id);
        check(result.error);
      },
    },
  };
}
