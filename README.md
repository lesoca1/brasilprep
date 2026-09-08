# BrasilPrep

Plataforma de preparação analítica para vestibulares. A Fase 2 implementa autenticação por e-mail e senha, perfis, catálogo de ingresso e trilhas persistidas em PostgreSQL via Supabase. Não há prática, pontuação ou analytics nesta fase.

## Começar no Windows ou em outro sistema

Requer Node.js 22 ou superior.

```bash
npm ci
```

Escolha uma das configurações abaixo. Sem conexão configurada, a aplicação mostra um estado explícito de indisponibilidade, sem usar contas fictícias.

### Opção A: projeto Supabase de desenvolvimento

1. Crie ou selecione um projeto **de desenvolvimento** no Supabase.
2. Autentique o CLI e associe o projeto:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

`db push` aplica e registra as migrations. Não execute `db reset --linked` em um projeto com dados.

3. Aplique `supabase/seed.sql` pelo SQL Editor **somente no projeto de desenvolvimento**. O seed é separado da migration e não é carregado automaticamente no ambiente remoto. Todos os itens são marcados `is_development = true`; não há usuários, senhas ou notas de corte inventadas.
4. Em Authentication, habilite e-mail/senha, confirmação de e-mail e senha mínima de 12 caracteres. Configure a Site URL como `http://localhost:4173` e as URLs permitidas como `http://localhost:4173/confirmar/` e `http://localhost:4173/nova-senha/`. Para produção, use os endereços HTTPS reais e configure o envio de e-mail do projeto.
5. Copie `.env.example` para `.env.local`. Preencha a URL do projeto e a chave **publishable** pública:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Nunca use uma chave secret ou service_role nessas variáveis. Não envie senhas ou credenciais administrativas pelo chat. `.env.local` não entra no Git.

### Opção B: Supabase local

Requer Docker Desktop ou runtime compatível em execução.

```bash
npx supabase start
```

A configuração e as migrations já estão em `supabase/`. O CLI fornece a URL e a chave pública local para `.env.local`. Use o endereço da caixa de e-mail local informado pelo CLI para confirmar o cadastro; a configuração reserva a porta 54324.

Para reconstruir **um banco local descartável**, apagando os dados locais:

```bash
npx supabase db reset
```

Esse comando reaplica migrations e seed. Não é necessário executá-lo a cada inicialização.

### Abrir a aplicação

```bash
npm run dev
```

Abra http://localhost:4173/cadastro. Reinicie o servidor após mudar `.env.local`.

## Fluxo

Criar conta → confirmar e-mail → escolher vestibulares → selecionar instituição/curso/campus/modalidade → revisar objetivos → confirmar trilhas → painel.

- Uma trilha por vestibular por usuário. Múltiplos vestibulares são permitidos.
- Alterar objetivo mantém a identidade da trilha.
- Trocar trilha ativa salva a preferência no banco, inclusive entre dispositivos.
- Remover a trilha ativa seleciona outra trilha da conta. Remover a última retorna ao onboarding.
- O painel de uma conta nova não mostra métricas fictícias.
- Tema é uma preferência local do navegador. Dados de perfil e trilhas ficam no PostgreSQL.

## Verificações

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
npm test
```

`npm test` inclui testes SQL com PostgreSQL embarcado (PGlite), domínio, contrato de autenticação e exportação. Os testes de exportação exigem `build` antes. `npm run test:db` e `npm run test:unit` podem rodar isoladamente sem Docker, credenciais ou serviço remoto.

Os testes SQL executam a migration real, o seed e as políticas RLS. O contrato `auth.uid()` é simulado apenas no banco de teste. Os testes de autenticação usam respostas HTTP controladas para testar o SDK e tratamento de erros. **Esses testes não substituem validação com Supabase Auth real**, e não testam entrega de e-mail.

Veja [esquema e relações](docs/phase-2-schema.md), [decisões de arquitetura](docs/phase-2-architecture.md) e [roteiro de demonstração](docs/phase-2-review.md).

## Publicação

Next.js mantém a exportação estática nesta fase. Autenticação e dados são atendidos pelo Supabase; a autorização ocorre no PostgreSQL com RLS e funções transacionais. O HTML inicial contém apenas a tela neutra de carregamento, sem dados pessoais. As variáveis `NEXT_PUBLIC_*` são incorporadas no build; configure-as antes de publicar na Vercel ou gerar outra exportação.

Não foi instalado um banco no Sites, nem houve troca por SQLite. A versão publicada da Fase 1 permanece separada da branch da Fase 2 até configurar e validar o serviço real.

## Código

- `src/domain`: tipos e validação de seleção, sem dependência de Supabase.
- `src/data-access`: contratos e adaptador Supabase.
- `src/components/layout`: sessão, proteção visual de rotas e trilha ativa.
- `src/modules/auth`: cadastro, entrada, confirmação e recuperação de senha.
- `src/modules/onboarding`: seleção em três passos.
- `src/modules/tracks`: criação, edição, troca e remoção.
- `supabase/migrations`: alterações versionadas do esquema e autorização.
- `supabase/seed.sql`: catálogo exclusivo de desenvolvimento.

Referências: [Supabase Auth](https://supabase.com/docs/guides/auth), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [migrations](https://supabase.com/docs/guides/local-development/database-migrations).

## Fase 3: banco de questões

Acervo editorial com importação JSON validada, taxonomia e identificação de conteúdo sintético. Veja [instalação e roteiro de revisão](docs/phase-3-review.md) e [decisões de arquitetura](docs/phase-3-architecture.md). Nenhum fluxo de prática foi implementado.

## Fase 4: motor de prática

Sessões persistentes em modos Estudo e Teste, filtros, sinalização, chute, cronômetro, retomada e resultados básicos. A migration da Fase 4 e o conteúdo sintético de desenvolvimento foram aplicados a lesoca1's Project. Veja [roteiro de demonstração e estado da validação](docs/phase-4-review.md) e [decisões de confiabilidade](docs/phase-4-architecture.md).
