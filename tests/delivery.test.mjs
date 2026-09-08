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

test('public landing renders before authentication and links to real routes', () => {
  const html = readFileSync('out/index.html', 'utf8');
  assert.match(html, /id="hero-title"/);
  assert.match(html, /É sistema\./);
  assert.match(html, /Exemplo ilustrativo/);
  assert.doesNotMatch(
    html,
    /Carregando sua conta|Conexão ainda não configurada/,
  );
  assert.doesNotMatch(html, /[—–]/);
  assert.equal((html.match(/<details[\s>]/g) ?? []).length, 9);
  for (const match of html.matchAll(/href="(#[^"]+)"/g)) {
    assert.ok(html.includes(`id="${match[1].slice(1)}"`), match[1]);
  }
  for (const route of ['/cadastro/', '/entrar/']) {
    assert.ok(html.includes(`href="${route}"`), route);
    assert.ok(existsSync(`out${route}index.html`));
  }
  for (const asset of [
    'hero-green.jpg',
    'highlight.png',
    'platform-illustration.png',
  ]) {
    assert.ok(existsSync(`out/landing/${asset}`));
  }
});
