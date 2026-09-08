import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { parseDataset, type AnswerDataset } from '@/analytics/performance';
export interface AnalyticsRepository {
  load(): Promise<AnswerDataset>;
}
export function createAnalyticsRepository(
  client: SupabaseClient<Database>,
): AnalyticsRepository {
  return {
    async load() {
      const { data, error } = await client
        .rpc('performance_answers')
        .abortSignal(AbortSignal.timeout(30000));
      if (error)
        throw new Error(
          'Não foi possível carregar o histórico completo. Tente novamente.',
        );
      return parseDataset(data);
    },
  };
}
