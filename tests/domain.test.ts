import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSelection,
  describeTrilha,
  type Catalog,
} from '../src/domain/models';
const catalog: Catalog = {
  exams: [{ id: 'fuvest', name: 'FUVEST', active: true, is_development: true }],
  institutions: [],
  courses: [],
  targets: [
    {
      id: 'target',
      exam_id: 'fuvest',
      course_id: 'course',
      admission_year: 2027,
      competition_category: 'Development',
      phase: 'Development',
      cutoff_score: null,
      score_scale: null,
      source_url: null,
      verified_at: null,
      active: true,
      is_development: true,
    },
  ],
};
test('client rejects missing, duplicate and inactive choices before submission', () => {
  assert.doesNotThrow(() => validateSelection(['target'], catalog));
  assert.throws(() => validateSelection([], catalog));
  assert.throws(() => validateSelection(['missing'], catalog));
  assert.throws(() => validateSelection(['target', 'target'], catalog));
  assert.throws(() =>
    validateSelection(['target'], {
      ...catalog,
      exams: [{ ...catalog.exams[0], active: false }],
    }),
  );
});
test('missing catalog relations do not create fabricated course details', () => {
  assert.equal(
    describeTrilha(
      {
        id: 't',
        user_id: 'u',
        exam_id: 'fuvest',
        target_id: 'target',
        created_at: '',
        updated_at: '',
      },
      catalog,
    ),
    null,
  );
});
