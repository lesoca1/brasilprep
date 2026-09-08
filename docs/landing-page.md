# Landing page do BrasilPrep

A rota `/` é pública e renderiza sem aguardar a autenticação. O painel permanece em `/dashboard`. Esta revisão muda apresentação e conteúdo; não altera cadastro, banco, prática ou indicadores.

## Direção editorial e visual

O slogan e os títulos usam Poppins local, com pesos 400, 600 e 700. Arquivos oficiais obtidos do Google Fonts, com licença SIL Open Font License preservada em `public/fonts/poppins/OFL.txt`. Não há requisição de fonte a terceiros durante o uso da página.

O fundo verde e a pincelada vêm do PDF `header brasilproject.pdf` fornecido pelo usuário. A nova ilustração conceitual está em `public/landing/platform-illustration.png`: três painéis com gráfico, alternativas e taxonomia, sem estatísticas. Criada com a ferramenta integrada de geração de imagens, em uma única geração, com transparência. Brief utilizado: três painéis brancos sobrepostos, gráfico abstrato, cartão de alternativas e lista hierárquica, traço editorial cartoon verde escuro, detalhes amarelos, sombras discretas, sem personagens, palavras, números ou marcas.

A sequência explica o trabalho manual de preparação, mostra o fluxo de sessão/correção/análise, apresenta recursos, informa o estado de construção, mantém FAQ e termina com contato e rodapé. Foram removidos bordões, frases de rodapé decorativas e chamadas repetidas. Usamos “há décadas”, sem transformar a referência de 60 anos em uma afirmação histórica sem fonte.

## Cobertura e contato

Os vestibulares exibidos correspondem ao catálogo de desenvolvimento de `supabase/seed.sql`. A página os identifica como opções de desenvolvimento, sem alegar banco oficial completo. Quantidades de bancas, questões oficiais, matérias e subtemas não foram publicadas porque ainda não há totais de cobertura verificados. São exibidos os estados do acervo. Os três níveis de taxonomia são uma característica real da estrutura.

A seção de contato está preparada, mas o endereço público ainda precisa ser fornecido pelo proprietário. `contactEmail` em `landing-content.ts` é nulo até essa definição. Com um e-mail aprovado, a seção exibe um link `mailto:`. Enquanto isso, informa que o canal será divulgado. Não há formulário que simule envio nem endereço inventado.

## Movimento e acessibilidade

Rolagem suave nas âncoras, entrada curta da ilustração, aparição de seções ao entrar na tela, estados de hover e foco. Sem animação contínua ou rolagem controlada por JavaScript. `prefers-reduced-motion` remove as transições, animações e rolagem suave. Conteúdo permanece visível sem JavaScript ou sem IntersectionObserver; o efeito só é ativado para elementos abaixo da tela após montagem. O FAQ continua nativo e o menu móvel devolve foco ao botão ao fechar com Escape.

## Revisão

Build, lint, typecheck, format:check e testes de entrega. A revisão interativa no navegador permanece pendente. Conferir desktop e celular, tema claro/escuro, âncoras, FAQ, Poppins e preferência de movimento reduzido. Cadastro e login continuam nas rotas existentes. Não houve publicação automática da alteração.
