# 🔧 CORREÇÃO DO ERRO DE ROW LEVEL SECURITY

## ❌ Erro Encontrado

```
Erro ao salvar jogada: Error: Erro ao registrar jogada: 
new row violates row-level security policy for table "ranking_familia"
```

## 🔍 Causa do Problema

O Supabase usa **Row Level Security (RLS)** para proteger os dados. A tabela `ranking_familia` estava configurada apenas para **leitura (SELECT)**, mas os triggers SQL precisam fazer **INSERT** e **UPDATE** nesta tabela para atualizar o ranking automaticamente.

Quando um jogo tenta salvar uma jogada:
1. ✅ A jogada é inserida em `historico_jogadas` (permitido)
2. ✅ O trigger atualiza a tabela `perfis` (permitido)
3. ❌ O trigger tenta atualizar `ranking_familia` (BLOQUEADO pelo RLS)

## ✅ Solução

Execute o script SQL de correção no Supabase para adicionar as políticas que faltam.

### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em **"SQL Editor"**

3. **Execute o Script de Correção**
   - Clique em **"+ New query"**
   - Copie e cole o conteúdo do arquivo `/supabase/fix_rls_policies.sql`
   - Clique em **"Run"** (ou pressione Ctrl+Enter)

4. **Verifique o Resultado**
   - Você deve ver a mensagem: `"Políticas RLS corrigidas com sucesso! ✅"`
   - Abaixo, uma tabela mostrando as 3 políticas criadas:
     - `Ranking é visível para todos` (SELECT)
     - `Ranking pode ser criado por todos` (INSERT)
     - `Ranking pode ser atualizado por todos` (UPDATE)

## 📋 Script de Correção Rápida

Se preferir, copie e cole este script diretamente no SQL Editor:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Ranking é visível para todos" ON ranking_familia;
DROP POLICY IF EXISTS "Ranking pode ser criado por todos" ON ranking_familia;
DROP POLICY IF EXISTS "Ranking pode ser atualizado por todos" ON ranking_familia;

-- Criar políticas corretas
CREATE POLICY "Ranking é visível para todos"
ON ranking_familia FOR SELECT
USING (true);

CREATE POLICY "Ranking pode ser criado por todos"
ON ranking_familia FOR INSERT
WITH CHECK (true);

CREATE POLICY "Ranking pode ser atualizado por todos"
ON ranking_familia FOR UPDATE
USING (true);

-- Verificar
SELECT 'Políticas RLS corrigidas com sucesso! ✅' AS status;
```

## 🧪 Testando a Correção

Após executar o script:

1. **Recarregue o aplicativo** (F5)
2. **Jogue qualquer minigame**
3. **Verifique no console do navegador**:
   - Não deve mais aparecer o erro de RLS
   - Deve aparecer: "✅ Jogada registrada com sucesso"
4. **Verifique o ranking**:
   - Os pontos devem aparecer corretamente
   - O ranking deve atualizar

## 📊 Verificando no Banco de Dados

Para confirmar que está funcionando, no Supabase Dashboard:

1. Vá em **"Table Editor"**
2. Selecione a tabela **"historico_jogadas"**
   - Deve ter registros das jogadas
3. Selecione a tabela **"ranking_familia"**
   - Deve ter registros com pontuações atualizadas
4. Selecione a tabela **"perfis"**
   - Os pontos dos jogadores devem estar atualizados

## 🔐 O Que São as Políticas RLS?

Row Level Security (RLS) é um recurso do PostgreSQL que controla quem pode acessar quais linhas de uma tabela:

- **SELECT**: Quem pode LER os dados
- **INSERT**: Quem pode CRIAR novos registros
- **UPDATE**: Quem pode ATUALIZAR registros existentes
- **DELETE**: Quem pode DELETAR registros

No nosso caso, configuramos todas como `USING (true)` e `WITH CHECK (true)`, o que significa que **todos os usuários autenticados** podem fazer essas operações. Para um sistema de produção real, você poderia restringir isso por usuário ou família.

## ⚠️ Nota de Segurança

As políticas atuais permitem que qualquer usuário autenticado possa:
- Ver todos os rankings
- Criar entradas de ranking
- Atualizar rankings

Para produção, considere políticas mais restritivas como:

```sql
-- Exemplo: Apenas o próprio jogador pode atualizar seu ranking
CREATE POLICY "Jogador pode atualizar próprio ranking"
ON ranking_familia FOR UPDATE
USING (integrante_id = auth.uid());
```

Mas para o escopo deste projeto educacional, as políticas permissivas são adequadas.

## 🎯 Resultado Esperado

Após a correção:
- ✅ Jogos salvam normalmente
- ✅ Pontos são contabilizados
- ✅ Ranking atualiza automaticamente
- ✅ Sem erros no console
- ✅ Triggers funcionam corretamente

## 📝 Arquivos Relacionados

- `/supabase/schema.sql` - Schema completo com políticas corretas
- `/supabase/fix_rls_policies.sql` - Script de correção isolado
- `/CORRECAO_PONTUACAO.md` - Documentação do sistema de pontuação

## 🆘 Se o Erro Persistir

1. **Verifique se executou o script** no projeto correto do Supabase
2. **Recarregue completamente** o navegador (Ctrl+Shift+R)
3. **Limpe o cache** do navegador
4. **Verifique no console** se há outros erros
5. **No SQL Editor**, execute:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'ranking_familia';
   ```
   - Deve mostrar 3 políticas

Se ainda assim tiver problemas, pode ser necessário recriar as tabelas executando o `/supabase/schema.sql` completo novamente.
