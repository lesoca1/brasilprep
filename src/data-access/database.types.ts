import type {
  AdmissionTarget,
  Course,
  Exam,
  Institution,
  Profile,
  Trilha,
} from '@/domain/models';
type Table<T> = {
  Row: T;
  Insert: never;
  Update: Partial<T>;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      exams: Table<Exam>;
      institutions: Table<Institution>;
      courses: Table<Course>;
      admission_targets: Table<AdmissionTarget>;
      profiles: Table<Profile>;
      trilhas: Table<Trilha>;
    };
    Views: Record<string, never>;
    Functions: {
      confirm_trilhas: { Args: { target_ids: string[] }; Returns: undefined };
      switch_trilha: { Args: { trilha_id: string }; Returns: undefined };
      change_trilha_target: {
        Args: { trilha_id: string; new_target_id: string };
        Returns: undefined;
      };
      remove_trilha: { Args: { trilha_id: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
