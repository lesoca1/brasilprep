# Revisão da Fase 1

## O que revisar

1. Abra `/dashboard`: avalie objetivo, densidade de indicadores e leitura do gráfico.
2. Troque FUVEST por UNICAMP no topo. Objetivo, indicadores, evolução, histórico e próximo foco devem mudar juntos. O banco de questões acompanha a trilha.
3. Em `/trilhas`, selecione uma trilha e volte ao painel. Nenhuma conta ou meta real é criada.
4. Em `/praticar`, altere disciplina, assunto, quantidade, dificuldade e modo. O resumo acompanha as escolhas. Iniciar permanece desabilitado.
5. Em `/simulados`, confira o estado vazio e as informações ainda não definidas.
6. Em `/desempenho`, confira a tabela. Percentil, distribuição e estimativa de aprovação devem aparecer indisponíveis.
7. Em `/questoes`, busque “resistor”, filtre por disciplina e abra uma explicação. Busque um termo inexistente para ver o estado vazio.
8. Em `/configuracoes`, alterne os temas. Recarregue para verificar persistência local.
9. Reduza a janela a cerca de 390 px. Use o botão de menu; cartões passam a uma coluna e tabelas permitem rolagem própria.
10. Navegue com Tab. Confira foco visível, link “Pular para o conteúdo”, selects e radio buttons. Aumente o zoom para 200%.
11. Abra uma rota inexistente para testar a página 404.

## Limitações intencionais

Sem login, banco, respostas salvas, motor de prática, simulados executáveis, corte oficial, cálculos analíticos ou comparação entre usuários. A seleção de trilha reinicia ao recarregar. Apenas tema persiste no dispositivo. A troca de curso ainda não existe.

## Decisões para a revisão

Validar hierarquia, densidade, paleta clara/escura, nomes das áreas e a convenção de distância positiva até a meta. A implementação da próxima fase exige autorização expressa e definição de escopo.

## Verificação realizada nesta entrega

- Build de produção: aprovado, todas as rotas estáticas geradas.
- TypeScript estrito e lint: aprovados.
- Testes de exportação: 9 aprovados, cobrindo navegação, identificação de demonstração, idioma, estados indisponíveis e ações futuras desabilitadas.
- Browser: páginas e conteúdo acessíveis na prévia interna. A captura de imagem falhou por timeout e as interações não puderam ser confirmadas de forma confiável nessa prévia. Revisão visual em celular, zoom, tema e fluxo interativo permanece no roteiro acima; não foi declarada como aprovada.
