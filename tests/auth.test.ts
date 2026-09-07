import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { createServices } from '../src/data-access/supabase';
import type { Database } from '../src/data-access/database.types';
function clientWith(
  response: unknown,
  status = 200,
  inspect?: (url: string, body: Record<string, unknown>) => void,
) {
  return createClient<Database>(
    'https://example.supabase.co',
    'public-test-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: async (input, init) => {
          inspect?.(
            String(input),
            JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>,
          );
          return new Response(JSON.stringify(response), {
            status,
            headers: {
              'Content-Type': 'application/json',
              'X-Supabase-Api-Version': '2024-01-01',
            },
          });
        },
      },
    },
  );
}
test('signup sends profile metadata and waits for confirmation when no session is returned', async () => {
  let sent: Record<string, unknown> = {};
  let requested = '';
  const service = createServices(
    clientWith(
      { user: { id: 'u', email: 'student@example.com', identities: [] } },
      200,
      (url, body) => {
        sent = body;
        requested = url;
      },
    ),
  );
  const result = await service.auth.signUp(
    'student@example.com',
    'Long-password-123',
    'Estudante',
    'http://localhost:4173/confirmar/',
  );
  assert.equal(result.needsConfirmation, true);
  assert.equal(sent.email, 'student@example.com');
  assert.deepEqual(sent.data, { display_name: 'Estudante' });
  assert.match(requested, /redirect_to=/);
});
test('invalid login and unconfirmed email return clear errors without a session', async () => {
  for (const [code, message] of [
    ['invalid_credentials', 'E-mail ou senha incorretos.'],
    ['email_not_confirmed', 'Confirme seu e-mail antes de entrar.'],
  ]) {
    const service = createServices(
      clientWith({ code, message: 'remote detail' }, 400),
    );
    await assert.rejects(service.auth.signIn('student@example.com', 'wrong'), {
      message,
    });
  }
});
test('network failures do not reveal backend details in auth errors', async () => {
  const service = createServices(
    clientWith(
      { code: 'unexpected_failure', message: 'private server diagnostics' },
      500,
    ),
  );
  await assert.rejects(
    service.auth.signIn('student@example.com', 'wrong'),
    /Não foi possível concluir/,
  );
});
test('sessionless identity is anonymous, not a mock account', async () => {
  const service = createServices(clientWith({}));
  assert.equal(await service.auth.identity(), null);
});
