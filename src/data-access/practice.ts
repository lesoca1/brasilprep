import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type {
  PracticeCatalog,
  PracticeSession,
  PracticeSummary,
  PendingPractice,
} from '@/domain/practice';
export class PracticeError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}
export interface PracticeRepository {
  list(): Promise<PracticeSummary[]>;
  catalog(trilhaId: string): Promise<PracticeCatalog>;
  read(id: string): Promise<PracticeSession>;
  perform(operation: PendingPractice): Promise<PracticeSession>;
}
export function createPracticeRepository(
  client: SupabaseClient<Database>,
): PracticeRepository {
  async function call<T>(
    action: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    const { data, error } = await client
      .rpc('practice', { action, payload })
      .abortSignal(AbortSignal.timeout(15000));
    if (error) {
      const messages: Record<string, string> = {
        insufficient_questions:
          'Não há questões suficientes para estes filtros.',
        revision_conflict:
          'Esta sessão mudou em outra aba ou dispositivo. Sua alteração local está preservada.',
        session_closed:
          'Esta sessão já foi finalizada em outra aba ou dispositivo.',
        study_answer_locked:
          'No modo estudo, a resposta confirmada não pode ser alterada.',
        trilha_not_found: 'A trilha não está disponível para esta conta.',
        session_not_found: 'Sessão indisponível para esta conta.',
        invalid_config: 'Confira os filtros e a quantidade de questões.',
        operation_conflict:
          'Conflito de operação. A alteração local foi preservada para revisão.',
      };
      const code = Object.keys(messages).find((k) => error.message.includes(k));
      throw new PracticeError(
        code
          ? messages[code]
          : 'Não foi possível concluir a conexão. Confira o estado de sincronização e tente novamente.',
        code ?? 'connection',
      );
    }
    return data as T;
  }
  return {
    list: () => call('list', {}),
    catalog: (trilhaId) => call('catalog', { trilha_id: trilhaId }),
    read: (id) => call('read', { session_id: id }),
    perform: (op) => call(op.action, op.payload),
  };
}
