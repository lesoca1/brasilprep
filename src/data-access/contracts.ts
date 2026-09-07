import type { Identity, Workspace } from '@/domain/models';
export interface AuthGateway {
  identity(): Promise<Identity | null>;
  subscribe(listener: () => void): () => void;
  signUp(
    email: string,
    password: string,
    name: string,
    redirectTo: string,
  ): Promise<{ needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string, redirectTo: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
}
export interface WorkspaceRepository {
  load(): Promise<Workspace>;
  confirmTargets(targetIds: string[]): Promise<void>;
  switchTrilha(id: string): Promise<void>;
  changeTarget(id: string, targetId: string): Promise<void>;
  removeTrilha(id: string): Promise<void>;
  updateProfile(name: string): Promise<void>;
}
export type AppServices = { auth: AuthGateway; workspace: WorkspaceRepository };
