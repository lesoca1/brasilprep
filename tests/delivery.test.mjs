import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const routes = [
  'dashboard',
  'trilhas',
  'praticar',
  'simulados',
  'desempenho',
  'questoes',
  'configuracoes',
  'entrar',
  'cadastro',
  'onboarding',
  'confirmar',
  'recuperar-senha',
  'nova-senha',
];
for (const route of routes)
  test(`/${route}: exported without private data or demo metrics`, () => {
    const html = readFileSync(`out/${route}/index.html`, 'utf8');
    assert.match(html, /lang="pt-BR"/);
    assert.match(html, /Carregando sua conta/);
    assert.doesNotMatch(
      html,
      /72,4%|1\.284|SYN-001|Perfil de exemplo|Leonardo/,
    );
    assert.doesNotMatch(html, /[—–]/);
  });
test('404 page is generated', () => assert.ok(existsSync('out/404.html')));
