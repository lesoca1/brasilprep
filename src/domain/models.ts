export type Exam = {
  id: string;
  name: string;
  active: boolean;
  is_development: boolean;
};
export type Institution = {
  id: string;
  name: string;
  abbreviation: string;
  is_development: boolean;
};
export type Course = {
  id: string;
  institution_id: string;
  name: string;
  campus: string;
  modality: string;
  is_development: boolean;
};
export type AdmissionTarget = {
  id: string;
  exam_id: string;
  course_id: string;
  admission_year: number;
  competition_category: string;
  phase: string;
  cutoff_score: number | null;
  score_scale: string | null;
  source_url: string | null;
  verified_at: string | null;
  active: boolean;
  is_development: boolean;
};
export type Profile = {
  id: string;
  display_name: string;
  active_trilha_id: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};
export type Trilha = {
  id: string;
  user_id: string;
  exam_id: string;
  target_id: string;
  created_at: string;
  updated_at: string;
};
export type Catalog = {
  exams: Exam[];
  institutions: Institution[];
  courses: Course[];
  targets: AdmissionTarget[];
};
export type Workspace = {
  profile: Profile;
  trilhas: Trilha[];
  catalog: Catalog;
};
export type Identity = { id: string; email?: string };
export type TrilhaDetails = {
  trilha: Trilha;
  exam: Exam;
  target: AdmissionTarget;
  course: Course;
  institution: Institution;
};
export function describeTrilha(
  trilha: Trilha,
  catalog: Catalog,
): TrilhaDetails | null {
  const exam = catalog.exams.find((e) => e.id === trilha.exam_id);
  const target = catalog.targets.find((t) => t.id === trilha.target_id);
  const course = catalog.courses.find((c) => c.id === target?.course_id);
  const institution = catalog.institutions.find(
    (i) => i.id === course?.institution_id,
  );
  return exam && target && course && institution
    ? { trilha, exam, target, course, institution }
    : null;
}
export function validateSelection(ids: string[], catalog: Catalog): void {
  if (ids.length < 1 || ids.length > 8)
    throw new Error('Selecione de um a oito vestibulares.');
  const targets = ids.map((id) =>
    catalog.targets.find(
      (t) =>
        t.id === id &&
        t.active &&
        catalog.exams.some((e) => e.id === t.exam_id && e.active),
    ),
  );
  if (
    targets.some((t) => !t) ||
    new Set(targets.map((t) => t?.exam_id)).size !== ids.length
  )
    throw new Error('Escolha um objetivo válido por vestibular.');
}
