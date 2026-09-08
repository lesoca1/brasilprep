# Fase 4: prática persistente

## O que foi entregue

- Configuração por trilha ativa, tipo de prática, modo, origem, disciplina, assunto, dificuldade, ano e quantidade.
- Sessões com conjunto fixo de questões, navegação, marcação para revisão e chute opcional.
- Estudo com correção após confirmar a primeira alternativa; teste com alterações permitidas até finalizar e correção somente depois.
- Persistência transacional de respostas e operações, retomada por URL/lista, operação pendente local e reenvio idempotente.
- Cronômetro decorrido, tempo por questão e resultados básicos.

## Banco

Migration: `supabase/migrations/20260908004804_practice_engine.sql`. Aplicada em **lesoca1's Project** (`rlkszjzmrtjwgzecbyrt`) em 08/09/2026. O nome do arquivo acompanha a versão registrada pelo Supabase.

| Tabela privada                | Conteúdo                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `practice_private.sessions`   | Usuário, trilha, exame, modo, origem, filtros, posição, revisão e início/fim.                    |
| `practice_private.items`      | Questão e seu snapshot, alternativa atual, acerto, chute, sinalização, tempo e data da resposta. |
| `practice_private.operations` | Identificador único da operação, conteúdo enviado, correção correspondente e data do banco.      |

Usuário → sessões → itens e operações. Cada item referencia uma questão do acervo. A sessão preserva seu exame mesmo quando a trilha ativa muda. A exclusão da trilha conserva a sessão com `trilha_id = null`; a exclusão da conta remove seus dados por cascade.

Somente `public.practice(action, payload)` expõe a API de prática. As tabelas privadas não têm permissões de acesso para alunos. A função verifica propriedade, bloqueia a sessão durante gravações e retira gabaritos/explicações da resposta enquanto devem permanecer ocultos. O cliente não calcula nem envia o resultado correto.

Foram carregados o catálogo de desenvolvimento de `supabase/seed.sql` e as duas questões de `public/question-import.synthetic.json`. Todos mantêm sua identificação de desenvolvimento, sem notas de corte ou benchmarks inventados. Nenhum usuário recebeu acesso editorial adicional. Nenhuma sessão de teste ficou no histórico remoto.

## Testar no computador

Use a branch/PR da Fase 4 e as variáveis de `.env.local` do projeto já conectado. Rode `npm ci` se atualizou a instalação, depois `npm run dev`. As migrations desta entrega já foram aplicadas ao projeto escolhido; não é necessário reaplicá-las manualmente pelo SQL Editor.

1. Entre na sua conta. Se ainda não concluiu o onboarding, crie a trilha FUVEST e escolha um objetivo do catálogo marcado como desenvolvimento.
2. Abra `/praticar`. Confira **FUVEST** no seletor de trilha superior.
3. Escolha **Personalizada**, modo **Teste**, origem **Exercícios sintéticos de desenvolvimento**, disciplina **Matemática**, assunto **Geometria plana**, dificuldade **Fácil**, ano **2026** e quantidade **2**.
4. Inicie. Selecione uma alternativa, marque chute e sinalize a questão. Espere **Respostas sincronizadas**. Não deve aparecer gabarito ou explicação.
5. Vá à próxima questão e atualize a página. O mesmo conjunto, posição, resposta, chute e sinalização devem permanecer. O cronômetro decorrido continua a partir do início salvo no banco.
6. Responda a segunda questão. Volte à primeira e altere sua resposta. Finalize e confirme o envio. Confira corretas, incorretas, em branco, percentual e explicações. Atualizar a página deve manter o mesmo resultado.
7. Volte às práticas e crie uma sessão em **Estudo**, com os mesmos filtros. Ao selecionar uma alternativa, aparece a explicação daquela questão e a resposta fica bloqueada. A próxima questão permanece sem gabarito até ser respondida.
8. Finalize a sessão de estudo. Confira os resultados na lista de sessões.

## Verificações de confiabilidade

- **Queda de conexão:** antes de selecionar uma alternativa, desligue a rede. A alteração deve ficar pendente neste navegador. Atualize a página e depois reconecte. Clique em **Tentar sincronizar** se necessário. A mesma operação deve ser confirmada uma única vez.
- **Duas abas/dispositivos:** abra a mesma sessão nos dois. Uma alteração baseada em revisão antiga deve gerar conflito, sem substituir a resposta mais nova. A alteração local fica visível. O descarte exige confirmação; depois confira e, no modo teste, reaplique a escolha desejada.
- **Repetição de envio:** enquanto salva, os controles ficam bloqueados. Repetir a requisição de envio ou atualizar o resultado não muda a data de finalização nem cria outra sessão.
- **Quantidade insuficiente:** peça mais questões do que o filtro oferece. A interface bloqueia o início; o banco também rejeita chamadas diretas. Não há redução silenciosa da quantidade.
- **Origem oficial:** o acervo oficial está vazio. Selecioná-lo mostra zero disponíveis. Isso é esperado, não uma falha.

## Evidência de teste

Executados testes locais contra as migrations reais em PGlite: geração fixa, reimportação/criação idempotente, respostas, retomada, gabarito oculto no teste, correção no estudo, resposta de estudo imutável, conflitos de revisão, operação duplicada, envio repetido, sessão fechada, acesso entre usuários, acesso anônimo, fila local e falha de armazenamento. Cálculo do resultado básico e formatação de tempo têm testes próprios.

No Supabase real, um teste transacional com identidade sintética executou criação, resposta, leitura de retomada, reenvio da mesma operação, finalização repetida e liberação de feedback nos dois modos. Todos os asserts passaram. O teste terminou com ROLLBACK e não deixou contas/sessões de teste.

A tentativa de demonstração no navegador usou temporariamente uma conta sintética e um PostgreSQL local isolado, sem dados reais. A prévia falhou ao carregar `app/layout.js` com `SyntaxError: Invalid or unexpected token`; o mesmo arquivo passou em `node --check`. Não foi possível concluir a demonstração visual. Todo o código temporário dessa tentativa foi removido antes do build final. Nenhum bypass de autenticação ou endpoint de QA acompanha a entrega.

## Segurança e limites

- Os advisors foram executados no Supabase. As tabelas privadas com RLS sem políticas seguem negação total por projeto, além dos privilégios revogados. Não são tabelas de acesso direto. [Explicação do aviso](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Permanecem os avisos preexistentes sobre as quatro RPCs de trilhas da Fase 2, que usam SECURITY DEFINER com verificação de dono, e sobre proteção contra senhas vazadas desativada no Auth. [Revisão de funções](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- O acesso anônimo ao helper de evento `public.rls_auto_enable()` foi revogado nesta migration; ele não é uma função do aplicativo.
- Sem teste completo de login e prática no navegador conectado ao Supabase. Isso permanece pendente para revisão, separado do teste real de banco já executado.
- O navegador guarda somente operação pendente e checkpoints de tempo por conta/sessão, não uma cópia durável completa do banco. Limpar dados do navegador antes de sincronizar elimina alterações ainda não confirmadas no servidor. A interface informa quando há pendências.
- Tempo por questão é uma medida do cliente com checkpoints de aproximadamente um segundo; não é antifraude. O tempo decorrido inclui pausas. Tempos por questão param enquanto a aba está oculta, uma gravação está pendente ou o diálogo de envio está aberto.
- Para bloqueio entre abas, o navegador precisa de Web Locks em contexto seguro: `localhost` durante desenvolvimento ou HTTPS na publicação. Se indisponível, o aplicativo recusa gravar em vez de presumir segurança.
- A lista mostra as 100 sessões mais recentes; links diretos continuam abrindo sessões antigas. Não há analytics avançado, nota oficial, simulado completo ou comparação entre usuários.

## Arquivos e comandos

- Domínio: `src/domain/practice.ts`.
- Acesso ao banco: `src/data-access/practice.ts` e registro em contratos/adaptador.
- Fila e tempo locais: `src/lib/practice-storage.ts`.
- Interface e coordenação: `src/modules/practice/`.
- Banco: migration da Fase 4 acima.
- Testes: `tests/practice.test.ts`.

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
npm test
```

Nenhuma próxima fase foi iniciada. A entrega permanece para revisão, com demonstração visual pendente.
