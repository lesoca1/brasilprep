'use client';
import { useState } from 'react';
import type { Catalog } from '@/domain/models';
export function TargetPicker({
  catalog,
  examId,
  value,
  onChange,
  disabled = false,
}: {
  catalog: Catalog;
  examId: string;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const candidates = catalog.targets.filter(
    (t) => t.exam_id === examId && t.active,
  );
  const target = candidates.find((t) => t.id === value);
  const selectedCourse = catalog.courses.find(
    (c) => c.id === target?.course_id,
  );
  const [institution, setInstitution] = useState(
    selectedCourse?.institution_id ?? '',
  );
  const [course, setCourse] = useState(selectedCourse?.id ?? '');
  const institutionIds = new Set(
    candidates.map(
      (t) => catalog.courses.find((c) => c.id === t.course_id)?.institution_id,
    ),
  );
  const courses = catalog.courses.filter(
    (c) =>
      c.institution_id === institution &&
      candidates.some((t) => t.course_id === c.id),
  );
  return (
    <div className="field-grid">
      <label className="field">
        Instituição
        <select
          required
          disabled={disabled}
          value={institution}
          onChange={(e) => {
            setInstitution(e.target.value);
            setCourse('');
            onChange('');
          }}
        >
          <option value="">Selecione</option>
          {catalog.institutions
            .filter((i) => institutionIds.has(i.id))
            .map((i) => (
              <option key={i.id} value={i.id}>
                {i.abbreviation}
              </option>
            ))}
        </select>
      </label>
      <label className="field">
        Curso, campus e modalidade
        <select
          required
          disabled={disabled || !institution}
          value={course}
          onChange={(e) => {
            setCourse(e.target.value);
            onChange('');
          }}
        >
          <option value="">Selecione</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.campus} · {c.modality}
            </option>
          ))}
        </select>
      </label>
      <label className="field wide-field">
        Objetivo de ingresso
        <select
          required
          disabled={disabled || !course}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">
            Selecione edição e modalidade de concorrência
          </option>
          {candidates
            .filter((t) => t.course_id === course)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.admission_year} · {t.competition_category} · {t.phase}
                {t.is_development ? ' · DESENVOLVIMENTO' : ''}
              </option>
            ))}
        </select>
      </label>
      {target?.is_development && (
        <p className="field-hint wide-field">
          Catálogo de desenvolvimento. Este objetivo não comprova oferta, regras
          ou nota de corte oficiais.
        </p>
      )}
    </div>
  );
}
