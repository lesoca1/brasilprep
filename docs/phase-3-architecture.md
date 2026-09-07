# Fase 3: decisões de implementação

Escopo: acervo interno, sem responder questões ou alimentar analytics.

- Importação JSON, até 500 questões / 5 MB por arquivo, transação única. Erro em qualquer registro cancela o lote inteiro.
- UUID obrigatório fornecido pela origem e imutável. Reimportação idêntica é idempotente. Alteração de conteúdo com mesmo ID é rejeitada nesta fase, evitando revisão silenciosa de gabaritos.
- Taxonomia: disciplina global, assunto único dentro da disciplina, subassunto único dentro do assunto. Chaves canônicas sem acentos; rótulos em português. Mesma chave com rótulo diferente exige revisão editorial e é rejeitada.
- Questões guardam referências relacionais à taxonomia e o documento validado original para importação/exportação reproduzível. Ano, exame, origem e dificuldade são indexáveis.
- Deduplicação por exame e enunciado normalizado (caixa e espaços). É conservadora: variantes com o mesmo enunciado exigem revisão manual. Não detecta paráfrases.
- `synthetic` e `official` são origens distintas, visíveis no acervo. Toda questão requer declaração de permissão; oficial também requer URL de fonte. A validação não substitui revisão humana dos direitos.
- Somente usuários explicitamente incluídos em `question_editors` pelo operador podem ler gabaritos ou importar. RLS e permissões protegem as tabelas; nenhuma decisão depende de metadados editáveis do usuário. RPC de importação usa SECURITY INVOKER.
- Mídia por HTTPS durável ou `/question-media/nome.ext`, com texto alternativo. Sem upload de arquivos ou HTML arbitrário nesta fase. URLs externas podem expirar ou falhar e a interface mostra erro por imagem. O exemplo usa um SVG autoral incluído no projeto.
- Apenas múltipla escolha A-E suportada agora. Outros tipos são rejeitados explicitamente até existir contrato de dados para eles.
