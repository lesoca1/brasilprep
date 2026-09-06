# Arquitetura da Fase 1

## Decisões

1. **Next.js App Router real.** Mantém o destino Vercel e os futuros recursos de servidor. O projeto não troca Next.js por uma camada de compatibilidade específica da hospedagem de revisão.
2. **TypeScript estrito.** Tipos de trilhas e questões ficam junto aos fixtures enquanto não existe domínio persistente. Não usamos `any`.
3. **Tailwind CSS 4 e tokens CSS.** Cores, bordas e superfícies usam propriedades CSS com dois temas. A folha global expressa padrões recorrentes sem espalhar valores por cada tela.
4. **Primitivos nativos e componentes pequenos.** Botões, links, painéis, títulos e estados vazios são reutilizáveis. Selects, radio buttons e details nativos resolvem as interações atuais. shadcn/ui não é necessário nesta fase; pode ser adotado quando surgir um componente que justifique a dependência.
5. **Estado limitado.** Contexto React compartilha a trilha ativa. Tema persiste somente no navegador, com fallback em caso de armazenamento bloqueado. Filtros e escolhas de prática são temporários.
6. **Exportação estática.** Sem servidor, credenciais, banco ou autenticação. A cópia privada de revisão usa a exportação; a arquitetura de produção continua compatível com Vercel. Supabase não foi instalado.
7. **Sem abstrações prematuras.** Não há repositórios vazios, scoring engines fictícios ou modelos de banco especulativos. As interfaces de acesso a dados surgirão na fase de persistência.

## Estrutura

| Local                   | Responsabilidade                                                        |
| ----------------------- | ----------------------------------------------------------------------- |
| `src/app`               | Rotas, metadata, layout, estilos globais e estados de erro/carregamento |
| `src/components/layout` | Navegação, troca de trilha e tema                                       |
| `src/components/ui`     | Primitivos visuais reutilizáveis                                        |
| `src/modules`           | Telas de cada área do produto                                           |
| `src/data/demo.ts`      | Fixtures sintéticos, isolados e tipados                                 |
| `src/lib/navigation.ts` | Definição central das rotas e rótulos da navegação                      |
| `tests`                 | Verificações da entrega estática                                        |
| `docs`                  | Decisões, limites e roteiro de revisão                                  |

O gráfico transforma coordenadas de uma série fictícia em SVG, sem inferir médias ou notas. Selecionar e filtrar fixtures não equivale a implementar analytics.

## Preparação para fases futuras

A UI usa componentes com textos recebidos por propriedades. A navegação tem rótulos centralizados e o documento declara `pt-BR`. Os demais textos estão nos módulos por tela; uma futura camada de traduções poderá extraí-los sem alterar regras de negócio. Inglês e biblioteca de tradução não foram implementados.

PostgreSQL e Supabase permanecem como preferência futura, com acesso por uma camada separada da UI. Scoring por vestibular deverá ter contratos próprios, critérios verificáveis e testes de cálculo. Nada disso está implementado.

Não se pode comparar percentuais livres de prática com uma nota de corte oficial. Para um futuro Target Gap, primeiro definir unidade, prova/fase, edição, modalidade de concorrência, fonte e comparabilidade dos resultados.
