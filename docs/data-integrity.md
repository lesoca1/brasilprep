# Integridade dos dados demonstrativos

Todos os números vêm de `src/data/demo.ts`, escrito para avaliação visual. Os blocos são exemplos independentes de apresentação, sem histórico de respostas que sustente agregações. Não há dados reais, resultados calculados ou inferência sobre aprovação.

| Elemento                 | Significado nesta fase                                                     | Limite                                                       |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Acerto em prática        | Percentual fictício exibido como fixture                                   | Não representa nota oficial                                  |
| Meta de prática          | Objetivo percentual fictício                                               | Não é nota de corte histórica                                |
| Distância até a meta     | Diferença ilustrativa positiva que falta até a meta, em pontos percentuais | Não é um Target Gap oficial ou previsão de aprovação         |
| Respostas registradas    | Contagem fictícia de exemplo                                               | Sem eventos de resposta persistidos                          |
| Série mensal             | Quatro pontos fictícios por exame                                          | Sem média móvel, ponderação ou tendência inferida            |
| Disciplina               | Linhas fictícias por exame                                                 | Não agregam matematicamente no indicador geral               |
| Próximo foco             | Sugestão fixa por trilha                                                   | Não há algoritmo de recomendação                             |
| Percentil e distribuição | Indisponíveis                                                              | Não assumir normalidade ou criar curva fictícia              |
| Nota de corte            | Indisponível                                                               | Exige fonte verificável e contexto de edição/fase/modalidade |

A distância exibida usa a convenção “quanto falta”: meta menos nível atual. O exemplo do prompt com sinal negativo usava uma convenção distinta. Essa convenção positiva e o rótulo “abaixo da meta” removem a ambiguidade visual. A regra oficial será validada na fase analítica.

Questões `SYN-*` são exercícios originais de demonstração. A associação com uma trilha serve apenas para testar separação visual. Não atribuímos ano, fase, fonte oficial ou representatividade de dificuldade. Não há cópia de bancos de questões.
