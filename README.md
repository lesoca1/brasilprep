# BrasilPrep

Fundação de uma plataforma de preparação analítica para vestibulares, em português. Fase 1: interface navegável, temas claro e escuro, dados sintéticos e arquitetura inicial.

## Executar

Requer Node.js 22 ou superior e npm.

```bash
npm ci
npm run dev
```

Abra http://localhost:4173/dashboard. Não são necessárias credenciais ou variáveis de ambiente.

## Verificar

```bash
npm run lint
npm run typecheck
npm run format:check
npm run build
npm test
```

Os testes de entrega inspecionam a exportação gerada. Execute `build` antes de `test`. Não há motor analítico nem cálculos de pontuação nesta fase.

## Telas

| Rota             | Conteúdo                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| `/dashboard`     | Objetivo, indicadores fictícios, tendência e próxima prática ilustrativa |
| `/trilhas`       | FUVEST e UNICAMP, com troca da trilha em visualização                    |
| `/praticar`      | Configuração visual de uma sessão, sem iniciar ou salvar respostas       |
| `/simulados`     | Estrutura inicial e estado vazio de histórico                            |
| `/desempenho`    | Exemplos por disciplina e estados indisponíveis para comparações         |
| `/questoes`      | Exercícios sintéticos, busca, filtro e explicações                       |
| `/configuracoes` | Temas claro e escuro e perfil demonstrativo                              |

A raiz também abre o painel. A trilha selecionada dura enquanto a aplicação permanece aberta; ao recarregar, volta a FUVEST. Apenas o tema usa armazenamento local, quando disponível.

## Escopo

Sem autenticação, banco, migrations, scoring, percentis, recomendações reais ou motor de prática. Valores são fixtures de design e não podem ser usados como dados de produção. Questões sintéticas não reproduzem o nível ou formato oficial das provas.

Consulte [arquitetura](docs/architecture.md), [definições de dados](docs/data-integrity.md) e [roteiro de revisão](docs/phase-1-review.md).

## Hospedagem

O projeto usa Next.js App Router, React, TypeScript estrito e Tailwind CSS. A Fase 1 exporta HTML estático em `out/`. Pode ser publicada na Vercel como projeto Next.js. A cópia de revisão no Sites usa o mesmo código e a exportação estática; não adiciona dependências de runtime ao produto. Ao introduzir autenticação e servidor, reavaliar `output: 'export'` em uma fase aprovada.

GitHub é o repositório de desenvolvimento: https://github.com/lesoca1/brasilprep. Revisar a branch `phase-1/foundation` antes de incorporar as mudanças à `main`.
