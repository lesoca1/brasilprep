# Fase 4: motor de prática

## Decisões

- Preservar Next.js estático + Supabase. A API transacional de prática usa funções PostgreSQL, como as mutações de trilhas. Nenhuma chave administrativa no cliente.
- Sessões, snapshots de questões e operações ficam no schema `practice_private`, fora da API de tabelas. RLS habilitada e privilégios de tabelas revogados. Um wrapper público SECURITY INVOKER chama a função privada SECURITY DEFINER, com `search_path` vazio e verificação explícita de `auth.uid()` e propriedade em cada operação. Isso é necessário para corrigir sem expor os gabaritos ao aluno.
- Cada sessão pertence ao usuário e ao exame/trilha selecionados na criação. Trocar a trilha ativa não altera sessões existentes. Remover uma trilha preserva o histórico (FK SET NULL), ainda ligado ao usuário e exame.
- Uma sessão aberta por usuário/trilha. UUID de criação gerado antes da requisição e guardado localmente. Repetir criação recupera a mesma sessão, sem sortear de novo.
- Conjunto de questões fixo, com snapshot imutável. Filtros por disciplina, assunto, dificuldade, ano e quantidade. Lotes insuficientes são recusados, sem reduzir a quantidade silenciosamente. Tipos: disciplina, assunto ou personalizada; sem simulado oficial nesta fase.
- Origem explícita: `official` por padrão; `synthetic` somente quando selecionada como desenvolvimento. Nunca misturar as duas na mesma sessão ou apresentar um resultado sintético como nota de vestibular.
- Estudo: primeira alternativa confirmada é definitiva e libera correção. Teste: permite alteração até o envio; gabaritos e explicações ficam fora das respostas da API antes disso.
- Cada operação tem UUID único, revisão esperada e registro persistente. Banco bloqueia a linha da sessão para serializar gravações; repetição idêntica é idempotente, mesmo após resposta HTTP perdida. Outra aba com revisão antiga recebe conflito explícito.
- Uma operação pendente por sessão é gravada em localStorage, separada por usuário e sessão, antes do envio. Se o armazenamento falhar, a interface não confirma a operação. Recarregar restaura e reenvia a mesma operação. Não depende de uma requisição durante `beforeunload`.
- O aluno vê quando existe alteração pendente. Enquanto isso, não pode gerar outra operação ou finalizar. Em conflito entre dispositivos, a alteração local fica preservada para conferência, sem sobrescrever respostas remotas em silêncio.
- Cronômetro da sessão usa `started_at` do banco e inclui pausas/tempo fora da página. Tempo por questão mede permanência visível na questão, com checkpoints locais e salvamento periódico. É uma medida do cliente, não um mecanismo antifraude.
- Envio final é idempotente e fecha a sessão sob o mesmo bloqueio das respostas. Respostas em branco são permitidas com confirmação explícita. Após fechar, nenhuma resposta muda.
- Resultados básicos: corretas, incorretas, em branco e acerto sobre total da sessão. Não é nota oficial ou analytics avançado.
