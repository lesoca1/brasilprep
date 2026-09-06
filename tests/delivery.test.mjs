import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const routes = [
  'dashboard',
  'trilhas',
  'praticar',
  'simulados',
  'desempenho',
  'questoes',
  'configuracoes',
];
for (const route of routes) {
  test(`/${route} is exported with the Portuguese shell and demo disclosure`, () => {
    const html = readFileSync(join('out', route, 'index.html'), 'utf8');
    assert.match(html, /lang="pt-BR"/);
    assert.match(html, /DEMONSTRAÇÃO/);
    assert.match(html, /dados fictícios/);
    assert.match(html, /id="main-content"/);
    for (const target of routes)
      assert.ok(
        html.includes(`href="/${target}/"`) ||
          html.includes(`href="/${target}"`),
        `missing navigation to ${target}`,
      );
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.doesNotMatch(html, /[—–]/);
  });
}
test('unavailable benchmarks are disclosed instead of fabricated', () => {
  const html = readFileSync('out/desempenho/index.html', 'utf8');
  assert.match(html, /Comparação indisponível/);
  assert.match(html, /Estimativa ainda não disponível/);
});
test('practice is not executable and questions are clearly synthetic', () => {
  assert.match(
    readFileSync('out/praticar/index.html', 'utf8'),
    /disabled=""[^>]*>Iniciar prática/,
  );
  assert.match(
    readFileSync('out/questoes/index.html', 'utf8'),
    /Conteúdo sintético/,
  );
  assert.ok(existsSync('out/404.html'));
});
