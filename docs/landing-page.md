# Landing page do BrasilPrep

A rota `/` apresenta o produto antes do login. O painel continua em `/dashboard`. A página renderiza no HTML estático, inclusive quando a autenticação está carregando, indisponível ou sem configuração. As rotas da aplicação mantêm suas verificações de sessão. O link da marca nas páginas de autenticação volta à apresentação.

## Conteúdo e visual

Referência fornecida: `header brasilproject.pdf`. O fundo verde (`hero-green.jpg`) e a pincelada (`highlight.png`) foram extraídos do PDF fornecido pelo usuário. A tipografia permanece texto HTML selecionável; não usamos uma captura do header como página. A navegação clara, a frase de abertura e o destaque seguem a referência. Os demais elementos estendem essa direção com verde escuro, bordas discretas e bastante espaço entre seções. O tema escuro segue a preferência existente.

Seções: abertura; propósito; ciclo de quatro passos; modos Estudo e Teste; exemplo de relatório; acesso pelo navegador; nove respostas no FAQ; chamada para cadastro e rodapé. O menu móvel abre por botão e o FAQ usa `details`/`summary` nativos. Cadastro e entrada apontam para as rotas reais. Não há formulário de suporte ou contato sem um destino confirmado.

A amostra de relatório é estática e identificada como fictícia: 18/35 = 51,4%, Matemática 12/20 = 60%, Física 6/15 = 40%, sem brancos. Ela não vem da conta do visitante nem é gravada no banco. Não promete acervo oficial completo, nota oficial, comparação com outros usuários ou aprovação. O FAQ explica o estado de desenvolvimento.

## Validação e revisão

Executar build, lint, typecheck, format:check e testes de entrega. O teste da página inicial confirma conteúdo renderizado sem aguardar autenticação, destinos internos, nove respostas no FAQ e presença dos assets. Os testes anteriores continuam verificando que páginas privadas exportadas não contêm dados pessoais.

Para revisão manual: abrir `/` sem login, navegar pelas âncoras, abrir e fechar perguntas com teclado, trocar o tema, usar o menu em tela estreita e seguir cadastro/entrada. Entrar normalmente para conferir `/dashboard`. A revisão interativa em navegador não foi executada nesta entrega.

Sem dependências novas, migrations ou alteração nos cálculos e respostas. A alteração é entregue em branch e PR, sem substituir automaticamente a publicação existente.
