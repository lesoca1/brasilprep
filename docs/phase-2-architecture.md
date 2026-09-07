# Decisões da Fase 2

## PostgreSQL e autenticação

Supabase fornece PostgreSQL, Auth e a API de dados. A interface usa apenas a chave pública e o token da sessão. Autorizações são aplicadas no backend por RLS, grants e funções SQL, mesmo que alguém ignore a navegação e chame a API diretamente.

A aplicação continua Next.js com exportação estática. O shell público não inclui registros de usuários. O navegador obtém a identidade com `getUser()` e carrega apenas dados autorizados pelo banco. Essa escolha mantém o frontend leve e compatível com Vercel sem implementar um segundo servidor de sessões nesta fase.

A sessão do SDK persiste no navegador; senhas são enviadas diretamente para Supabase Auth e não são armazenadas pelo BrasilPrep. A preferência de tema também fica no navegador. Perfil, trilhas e seleção ativa nunca usam armazenamento local como fonte de verdade.

O fluxo de confirmação usa o fluxo implícito do SDK, próprio de aplicações somente cliente, com URLs permitidas definidas no Supabase. Recuperação tem rota própria; nenhuma URL de retorno arbitrária vinda do usuário é usada. Se houver SSR de dados privados em uma fase futura, a sessão deverá migrar para o adaptador SSR e cookies, mantendo validação no servidor.

## Limite do provedor

`AuthGateway` e `WorkspaceRepository` ficam em `src/data-access/contracts.ts`. Os componentes dependem desses contratos; o SDK e chamadas SQL/API ficam no adaptador `supabase.ts`. Modelos e validação de seleção ficam em `src/domain`.

Não há cliente administrativo, service-role key, chave secreta ou conexão PostgreSQL direta no frontend. O esquema é versionado em migrations e o seed fica separado. Não há criação de tabelas durante startup da aplicação.

## Trilhas e objetivos

Uma trilha representa um vestibular para um usuário. Por isso há uma trilha por exame em cada conta. O objetivo pode ser alterado sem criar outra trilha ou misturar exames. Mais de um alvo simultâneo para o mesmo vestibular exigirá uma relação adicional em fase aprovada.

O catálogo de desenvolvimento cobre exemplos de sete vestibulares. ENEM aparece sem objetivo elegível, até cadastrar seu caminho de ingresso. Não foram verificadas regras oficiais de admissão; cada registro do seed informa sua natureza de desenvolvimento.

## Integridade e UX

Contas reais nunca recebem as métricas ou questões demonstrativas da Fase 1. Áreas de prática, simulados, desempenho e questões apresentam estados vazios coerentes com a ausência de dados. Os fixtures antigos permanecem isolados e sem importação nas telas ativas.

Mutações aguardam confirmação do banco antes de atualizar a interface. Falhas mostram mensagem e preservam escolhas quando o componente ainda está montado. Mudanças de identidade limpam o workspace anterior; respostas assíncronas ultrapassadas são descartadas. A remoção exige confirmação na interface.

## Operação pendente

O projeto Supabase remoto ainda não foi conectado nesta entrega. Não houve aplicação remota de migrations, criação de usuários reais, envio de e-mail ou publicação da Fase 2. Configuração local com Docker e Supabase CLI está documentada, mas não foi executada neste ambiente sem Docker.
