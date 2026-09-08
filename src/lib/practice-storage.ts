import type { PendingPractice } from '@/domain/practice';
export interface PracticeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export const pendingKey = (userId: string) =>
  `brasilprep-practice-pending:${userId}`;
export function readPending(
  storage: PracticeStorage,
  userId: string,
): PendingPractice | null {
  const value = storage.getItem(pendingKey(userId));
  if (!value) return null;
  const parsed: unknown = JSON.parse(value);
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('action' in parsed) ||
    !['start', 'save', 'submit'].includes(String(parsed.action)) ||
    !('payload' in parsed) ||
    !parsed.payload ||
    typeof parsed.payload !== 'object'
  )
    throw new Error(
      'Não foi possível ler a operação pendente. Preserve os dados deste navegador e contate o suporte.',
    );
  return parsed as PendingPractice;
}
export function savePending(
  storage: PracticeStorage,
  userId: string,
  op: PendingPractice,
) {
  const old = readPending(storage, userId);
  if (old && JSON.stringify(old) !== JSON.stringify(op))
    throw new Error(
      'Já existe uma operação pendente nesta conta. Sincronize antes de continuar.',
    );
  storage.setItem(pendingKey(userId), JSON.stringify(op));
}
export function clearPending(
  storage: PracticeStorage,
  userId: string,
  op: PendingPractice,
) {
  if (storage.getItem(pendingKey(userId)) === JSON.stringify(op))
    storage.removeItem(pendingKey(userId));
}
export const timeKey = (uid: string, sid: string, pos: number) =>
  `brasilprep-practice-time:${uid}:${sid}:${pos}`;
export function storedTime(
  storage: PracticeStorage,
  uid: string,
  sid: string,
  pos: number,
  base: number,
) {
  const n = Number(storage.getItem(timeKey(uid, sid, pos)));
  return Math.min(604800000, Math.max(base, Number.isFinite(n) ? n : 0));
}
