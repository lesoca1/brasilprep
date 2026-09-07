import { readFileSync, statSync } from 'node:fs';
import { validateQuestionBatch } from '../src/domain/questions';
const file = process.argv[2];
try {
  if (!file)
    throw new Error('Uso: npm run questions:validate -- caminho/questoes.json');
  if (statSync(file).size > 5 * 1024 * 1024)
    throw new Error('Arquivo excede 5 MB.');
  const result = validateQuestionBatch(
    JSON.parse(readFileSync(file, 'utf8')) as unknown,
  );
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  console.log(
    `${result.questions.length} questão(ões) válida(s). IDs, duplicatas no banco, taxonomia existente e direitos devem ser conferidos na importação.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Arquivo inválido.');
  process.exitCode = 1;
}
