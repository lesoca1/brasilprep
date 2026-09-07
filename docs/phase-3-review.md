# Fase 3: instalação e revisão

## Situação de entrega

Implementação e testes locais. O projeto remoto solicitado é **lesoca1’s Project**, para BrasilPrep. As ferramentas autenticadas do Supabase não estavam disponíveis nesta sessão; nenhuma migration, configuração de Auth ou concessão de editor foi aplicada remotamente. A instalação do skill não confirma acesso ao projeto. Não há chave pública inventada ou credencial administrativa no código.

A Fase 3 depende da Fase 2. Revise e integre primeiro o PR 2. As migrations devem ser aplicadas em ordem. O catálogo de desenvolvimento (`supabase/seed.sql`) continua separado e não roda automaticamente no banco remoto.

## Banco de dados

| Tabela               | Relação e propósito                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `question_editors`   | Usuário autorizado, FK para `auth.users`. Somente operador concede acesso.                                                                |
| `question_subjects`  | Disciplina global, chave única e nome normalizado único.                                                                                  |
| `question_topics`    | Assunto com FK para disciplina; chave e nome únicos dentro dela.                                                                          |
| `question_subtopics` | Subassunto com FK para assunto; chave e nome únicos dentro dele.                                                                          |
| `questions`          | UUID estável, FK para exame e subassunto, documento validado, ano/origem/dificuldade derivados, impressão do enunciado e data de criação. |

O caminho subassunto → assunto → disciplina identifica a taxonomia completa. Um trigger verifica que os rótulos e chaves do documento correspondem às referências relacionais. O exame continua independente da taxonomia; compartilhar uma disciplina não mistura resultados entre vestibulares.

RLS em todas as tabelas. Alunos não leem questões nem gabaritos. Editores podem ler/inserir; não podem conceder privilégios, atualizar ou apagar conteúdo. Não há pontuação, respostas, estatísticas ou prática.

## Preparação no projeto escolhido

1. Configure o projeto e Auth conforme README da Fase 2. Confira a referência de **lesoca1’s Project** antes de aplicar qualquer migration.
2. Na raiz do repositório, com o CLI autenticado e vinculado ao projeto correto: `npx supabase db push`. Em desenvolvimento, execute também `supabase/seed.sql` pelo SQL Editor, se ainda não houver catálogo.
3. Cadastre e confirme uma conta pelo aplicativo. Conclua o onboarding.
4. No SQL Editor, como operador do projeto, conceda acesso à conta correta. Substitua o UUID pelo identificador obtido em Authentication → Users:

```sql
insert into public.question_editors(user_id)
values ('UUID-DA-CONTA-CONFIRMADA')
on conflict do nothing;
```

Para revogar, remova apenas a linha dessa conta. A autorização é consultada no banco a cada operação, sem depender da renovação de JWT.

5. Configure as variáveis públicas documentadas em `.env.example` no ambiente local e reinicie `npm run dev`. Nunca use uma chave secreta no frontend.

## Demonstração reproduzível

1. Abra `/questoes` como editor. Baixe o JSON sintético da própria tela.
2. Selecione o arquivo: veja a quantidade e a origem antes de confirmar. Confirme a importação.
3. Duas questões devem aparecer. Expanda a questão do retângulo e confira imagem, descrição, alternativas, gabarito B, explicação, origem e ID.
4. Filtre por FUVEST, origem Sintéticas e dificuldade Fácil. Ambas aparecem. Origem Oficiais retorna vazio.
5. Reimporte o mesmo arquivo. Resultado: zero adicionadas, duas já existentes, IDs preservados.
6. Altere `correct_answer` para `F`. A validação local deve bloquear. Remova `source` ou deixe `statement` vazio: também deve bloquear.
7. Envie conteúdo diferente com um ID existente. O banco rejeita o lote inteiro. Use outro ID para o mesmo enunciado: a deduplicação também rejeita.
8. Entre com outra conta não autorizada. A tela indica acesso restrito, e consultas diretas ao banco não retornam gabaritos.
9. Confira o layout claro/escuro e a tela estreita. Falhas de imagens mostram o texto alternativo em vez de um espaço vazio.

## Formato de importação

Use `public/question-import.synthetic.json` como contrato de exemplo. Campos obrigatórios: `id`, `exam`, `year`, `phase`, `subject`, `topic`, `subtopic`, `difficulty`, `type`, `kind`, `statement`, `alternatives`, `correct_answer`, `explanation`, `source`, `images`.

- `id`: UUID fixo criado uma única vez pelo produtor do arquivo.
- `exam`: chave de exame existente no catálogo, como `fuvest`.
- Taxonomia: `{ "key": "geometria-plana", "name": "Geometria plana" }`. Reutilize chaves; variações editoriais não criam sinônimos automaticamente.
- `difficulty`: `easy`, `medium`, `hard`; `type`: `multiple_choice`.
- `kind`: `synthetic` ou `official`. Sintético significa exercício autoral de desenvolvimento, nunca questão aplicada pelo vestibular.
- `alternatives`: exatamente A, B, C, D, E; gabarito deve ser uma dessas letras.
- `source`: título e declaração de permissão obrigatórios. Questão oficial requer também URL HTTPS. Somente conteúdo autorizado deve ser importado.
- `images`: lista (pode ser vazia), cada item com `url` e `alt`. HTTPS durável ou arquivo versionado em `public/question-media`. Não use URLs assinadas temporárias. Não há upload de mídia nesta fase.

Validação sem conexão: `npm run questions:validate -- public/question-import.synthetic.json`.

## Verificação e limites

`npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build`, `npm test`.

Os testes executam as migrations reais em PostgreSQL embarcado (PGlite), verificando rollback, duplicatas, relações, idempotência, restrições e revogação. Isso não equivale a um teste remoto do Supabase/Auth. Ainda são necessárias aplicação remota e revisão manual da tela conectada. Advisors remotos também não foram executados sem acesso autenticado.

O acervo tem paginação de 20 questões e filtros por exame, origem e dificuldade. Não inclui edição de questões existentes, busca textual, aliases taxonômicos, importação CSV, upload, tipos discursivos ou fluxo de prática. Esses recursos não são necessários para o contrato JSON desta fase.
