# Fase 5: contrato das métricas

Fonte única: resposta final de cada item de sessão finalizada em `practice_private.items`, unida a `practice_private.sessions`. A taxonomia vem do snapshot da questão usado nessa sessão. Não usar eventos de autosave como tentativas, nem sessões em andamento. A API não expõe respostas de terceiros ou gabaritos de testes abertos.

| Indicador                           | Definição                                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acerto total                        | Corretas / total de itens nas sessões finalizadas. Brancos entram no denominador. Sem itens: indisponível, nunca 0%.                                          |
| Respondidas                         | Itens cuja alternativa final não é nula. Alterar resposta dentro da sessão não incrementa esse número.                                                        |
| Corretas / incorretas               | Correção final persistida no banco. Brancos ficam em categoria separada.                                                                                      |
| Questões distintas                  | Contagem de IDs únicos. Repetições em outras sessões são novas tentativas, mas não novas questões distintas.                                                  |
| Por vestibular                      | Mesma fórmula, agrupada por exame. Nunca um percentual único misturando exames.                                                                               |
| Por disciplina, assunto, subassunto | Mesma fórmula. Chaves compostas incluem exame, modo, origem e ancestrais taxonômicos, evitando homônimos.                                                     |
| Por dificuldade                     | Mesma fórmula, sobre a dificuldade do snapshot.                                                                                                               |
| Tempo médio por questão             | Soma do `spent_ms` armazenado / total de itens, incluindo brancos e tempos registrados como zero. Sem itens: indisponível. Não é o tempo decorrido da sessão. |
| Recente                             | Sessões finalizadas entre o instante de consulta menos 30 × 24 horas e esse instante, incluindo limites.                                                      |
| Período anterior                    | Os 30 dias anteriores ao recorte recente, com limite superior exclusivo. Não há sobreposição.                                                                 |
| Histórico mensal                    | Sessões agrupadas pelo mês da finalização no fuso America/Sao_Paulo. Só mostrar meses com dados, sem interpolar nem criar zeros.                              |

Todos os percentuais somam contagens antes de dividir. Nunca tirar média simples dos percentuais das sessões ou disciplinas. Os cálculos mantêm precisão numérica; a interface arredonda apenas na apresentação, para uma casa decimal.

## Escopo e amostras

- A página Desempenho usa a trilha ativa e filtros explícitos de modo e origem. O padrão é Teste + Oficial; dados sintéticos só aparecem quando escolhidos e ficam identificados. A tabela por vestibular mantém uma linha por exame sob os mesmos filtros.
- Repetir a mesma questão conta como tentativa adicional, coerente com a prática de repetição, mas não como evidência independente de aprendizagem.
- Menos de 20 questões distintas respondidas gera o aviso **Amostra pequena**. Esse limiar é uma regra editorial de cautela, não um teste estatístico ou prova de domínio. Acima dele também não classificamos domínio ou prontidão para aprovação.
- Cada linha mostra corretas/total, respondidas, questões distintas, percentual e tempo médio. Nem 1/1 nem 100/100 recebem rótulo de domínio.
- Toda sessão finalizada entra no histórico com sua resposta final. Estudo e Teste nunca se misturam na mesma métrica. Não há ranking, benchmarking, nota oficial, percentil, estimativa de aprovação ou recomendação nesta fase.

## Integridade e arquitetura

- Funções puras em `src/analytics/performance.ts`, independentes de React, Supabase e relógio global. Datas de referência entram como parâmetro.
- Duplicata idêntica de sessão/posição conta uma vez. Duplicata conflitante, correção ausente em resposta preenchida, data inválida ou tempo negativo interrompem o relatório, sem inventar substitutos.
- `public.performance_answers()` retorna um único documento JSON calculado em uma consulta SQL. Não existe limite silencioso de 1.000 registros do PostgREST sobre os itens internos desse documento. Sem tabelas/cache de indicadores que possam ficar desatualizados.
- O documento inclui data do servidor e apenas itens finalizados do usuário autenticado. A função privada possui autorização explícita e privilégios restritos; o wrapper público é SECURITY INVOKER.
- A interface espera o documento inteiro e sua validação antes de mostrar métricas. Falha de rede ou dados inválidos mostram erro, sem apresentar resultados parciais como totais.
- Para o produto inicial, o navegador agrega o histórico completo. Históricos muito grandes podem exigir agregação no servidor em fase posterior; não truncamos silenciosamente para melhorar desempenho.
- O resultado após finalizar a prática usa as mesmas funções da página Desempenho, a partir do snapshot devolvido pelo banco. Reabrir a sessão reproduz o mesmo resultado.

## Validar a fase

1. Execute `npm ci` e `npm run dev` com a configuração Supabase existente.
2. Em Praticar, escolha FUVEST, modo Teste, origem Sintética e duas questões. Responda uma e deixe a outra em branco. Finalize.
3. Confira corretas/2, uma respondida, um branco e o aviso de amostra pequena. Os detalhes de cada questão permitem conferir a correção e o tempo usados nos cálculos.
4. Recarregue a sessão finalizada. O resultado deve permanecer igual.
5. Em Desempenho, selecione Teste e Sintética. A sessão deve aparecer no total, no mês de conclusão e nos recortes de taxonomia/dificuldade. O resultado geral inclui outras sessões finalizadas do mesmo vestibular, modo e origem, se existirem.
6. Inicie outra sessão sem finalizar. Atualizar o histórico não deve alterar seus indicadores. Finalize e atualize novamente para incluí-la.
7. Troque modo, origem e Trilha. Os totais permanecem separados; recortes sem dados exibem estado vazio. Estudo inclui práticas com feedback imediato e não deve ser interpretado como teste independente.
8. Execute `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` e `npm test`.

Validação automatizada: 41 testes, incluindo aritmética, amostras pequenas, repetição, duplicatas, corrupção, limites de tempo e mês, além das migrations reais em PostgreSQL via PGlite. O teste SQL compara o resultado da sessão com o histórico, exclui sessões abertas em ambos os modos, confirma isolamento de usuários e nega acesso anônimo. Um histórico com 1.006 itens verifica ausência de truncamento no documento JSON.

A migração adiciona duas funções e um índice; não cria tabelas de estatísticas nem altera respostas. Aplicada ao projeto Supabase conectado. Consulta remota com transação revertida confirmou histórico vazio para identidade sem registros e privilégio anônimo negado. Não foram criadas respostas de demonstração no banco remoto nesta fase.

Verificação de segurança remota: sem novos avisos desta migração. Permanecem avisos anteriores sobre [funções de Trilha com SECURITY DEFINER](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), intencionalmente autorizadas por proprietário e cobertas pelos testes; [RLS sem políticas nas tabelas privadas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), que bloqueia acesso direto por desenho; e [proteção de senhas vazadas desativada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), configuração de Auth preexistente.

Limitações: tempo registrado no navegador é aproximado e não é uma medição de atenção; histórico inteiro é carregado antes de calcular; inspeção visual interativa no navegador não foi validada nesta fase. Nenhum benchmark, nota oficial ou conclusão de domínio foi implementado. Decisões editoriais para revisão: brancos no denominador, janela de 30 dias e aviso abaixo de 20 questões distintas respondidas.
