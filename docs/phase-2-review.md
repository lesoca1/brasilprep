# Demonstração e revisão da Fase 2

## Pré-requisito

Configurar Supabase, aplicar a migration e carregar o seed em desenvolvimento conforme README. Sem essas etapas, a tela informa que falta conexão; isso não é uma demonstração funcional de cadastro.

## Onboarding

1. Abra `/cadastro` e preencha nome, e-mail de teste e senha de pelo menos 12 caracteres.
2. Aguarde a mensagem de confirmação e abra o link recebido. No Supabase local, use a caixa de e-mail na porta 54324.
3. Entre na conta e selecione **FUVEST** e **UNICAMP**.
4. Para FUVEST, escolha **USP**, **Ciências Econômicas · FEA · São Paulo · Presencial** e o objetivo de desenvolvimento de 2027.
5. Para UNICAMP, escolha **UNICAMP**, **Ciências Econômicas · Campinas · Presencial** e o objetivo de desenvolvimento de 2027.
6. Confira o resumo e clique em **Confirmar trilhas**.
7. O painel mostra a trilha ativa. Não há porcentagens, respostas ou percentis fictícios.

## Troca e edição de trilhas

1. No seletor do topo, altere para UNICAMP.
2. Recarregue a página. UNICAMP deve continuar ativa, pois a escolha está no perfil no banco.
3. Saia e entre novamente, ou use outro navegador na mesma conta. A seleção persiste.
4. Em `/trilhas`, altere o objetivo FUVEST para **Administração · FEA · São Paulo** e salve.
5. Volte à FUVEST. O painel apresenta o curso novo e preserva o ID da trilha.
6. Inicie remoção e cancele. Nada muda.
7. Confirme a remoção da trilha ativa. Outra trilha própria será selecionada.
8. Remova a última. A aplicação retorna ao onboarding e permite criar uma nova trilha.

## Autenticação e autorização

- Tente entrar com senha incorreta e com e-mail ainda não confirmado: mensagem clara, sem workspace.
- Abra o painel desconectado: redirecionamento para entrada, sem dados de outra conta.
- Use recuperação de senha e valide o link com o serviço de e-mail real.
- Crie uma segunda conta: não deve enxergar o perfil ou trilhas da primeira.
- Troque nome e tema: nome persiste no banco; tema é local ao navegador.

## Verificação automática e limites

Os testes SQL demonstram as operações de onboarding, troca e edição diretamente no banco, incluindo persistência após reabrir o banco. Testes de Auth usam transporte HTTP controlado, sem envio de e-mail ou contas reais.

A demonstração de ponta a ponta acima depende de conectar o projeto Supabase. Não foi marcada como concluída sem isso. Não confundir build e testes unitários com uma sessão real de cadastro.

A fase seguinte não está autorizada. Não há motor de questões, correção, analytics ou scoring nesta entrega.
