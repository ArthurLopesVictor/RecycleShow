# ✅ SOLUÇÃO COMPLETA DOS PROBLEMAS DE PONTUAÇÃO

## 📋 Resumo Executivo

Dois problemas foram identificados e corrigidos:

1. ✅ **Jogos não salvavam no banco** → Corrigido
2. ✅ **Políticas RLS bloqueavam o ranking** → Corrigido

---

## 🔴 Problema 1: Jogos Não Salvavam no Banco de Dados

### Sintoma
- Jogos funcionavam, mas pontos não apareciam no ranking
- Dados salvos apenas no localStorage (temporário)

### Causa
- Todos os 5 minigames usavam `mockData.ts` em vez do Supabase
- Funções `saveMetric()` e `savePlayerProgress()` salvavam localmente

### Solução Aplicada
Atualizados todos os jogos para usar `supabaseClient.registrarJogada()`:

```typescript
// ❌ ANTES (errado)
saveMetric({ userId, questionId, correct, ... });
savePlayerProgress(userId, 'quiz', level, score);

// ✅ DEPOIS (correto)
await supabaseClient.registrarJogada({
  jogador_id: currentPlayer.id,
  jogo: 'quiz',
  nivel: difficulty,
  acerto: isCorrect,
  tempo_resposta: timeSpent,
  pontuacao: pontuacao,
  dificuldade: 'Fácil' | 'Médio' | 'Difícil',
  dados_adicionais: { ... }
});
```

### Arquivos Modificados
- ✅ `/components/QuizGame.tsx`
- ✅ `/components/SortingGame.tsx`
- ✅ `/components/MemoryGame.tsx`
- ✅ `/components/RouteGame.tsx`
- ✅ `/components/CompostingGame.tsx`
- ✅ `/components/FamilyRanking.tsx`

---

## 🔴 Problema 2: Políticas RLS Bloqueavam o Ranking

### Sintoma
```
Erro ao salvar jogada: Error: Erro ao registrar jogada: 
new row violates row-level security policy for table "ranking_familia"
```

### Causa
A tabela `ranking_familia` tinha apenas política de **SELECT** (leitura), mas os triggers SQL precisam fazer **INSERT** e **UPDATE**.

Fluxo bloqueado:
```
Jogada → historico_jogadas ✅
      → Trigger atualiza perfis ✅
      → Trigger atualiza ranking_familia ❌ BLOQUEADO!
```

### Solução
Adicionar políticas RLS para INSERT e UPDATE na tabela `ranking_familia`.

### Como Corrigir

**Opção 1: Script Rápido (Recomendado)**

No Supabase SQL Editor, execute:

```sql
DROP POLICY IF EXISTS "Ranking pode ser criado por todos" ON ranking_familia;
DROP POLICY IF EXISTS "Ranking pode ser atualizado por todos" ON ranking_familia;

CREATE POLICY "Ranking pode ser criado por todos"
ON ranking_familia FOR INSERT
WITH CHECK (true);

CREATE POLICY "Ranking pode ser atualizado por todos"
ON ranking_familia FOR UPDATE
USING (true);
```

**Opção 2: Script Completo**

Execute o arquivo `/supabase/fix_rls_policies.sql` no SQL Editor.

**Opção 3: Recriar Tudo**

Se preferir começar do zero, execute `/supabase/schema.sql` completo (que já inclui as políticas corretas).

---

## 🎯 Como Funciona Agora

### Fluxo Completo de Pontuação

```
1. Jogador joga um minigame
   ↓
2. Jogo chama supabaseClient.registrarJogada()
   ↓
3. Jogada inserida na tabela "historico_jogadas"
   ↓
4. TRIGGER: atualizar_estatisticas_perfil()
   ├─ Atualiza "perfis.pontos"
   ├─ Atualiza "perfis.precisao"
   ├─ Atualiza "perfis.total_jogadas"
   └─ Atualiza "perfis.desempenho_por_dificuldade"
   ↓
5. TRIGGER: atualizar_ranking_familia()
   ├─ Insere/Atualiza "ranking_familia.pontuacao_total"
   └─ Atualiza "ranking_familia.ultima_jogada"
   ↓
6. Ranking atualizado em tempo real ✅
```

### Pontuação por Jogo

| Jogo | Pontos por Acerto |
|------|------------------|
| Quiz | 10 pontos |
| Sorting | 20 pontos |
| Memory | 15 pontos (par) |
| Route | Variável (volume + eficiência) |
| Composting | 10 pontos |

### Estatísticas Calculadas Automaticamente

- **Pontos Totais**: Soma de todas as jogadas
- **Precisão**: (Acertos / Total de Jogadas) × 100
- **Tempo Médio**: Média dos tempos de resposta
- **Desempenho por Dificuldade**: JSON com estatísticas por nível

---

## 🧪 Testando o Sistema

### Teste 1: Salvar Jogada
1. Jogue qualquer minigame
2. Verifique o console do navegador:
   ```
   ✅ Esperado: "Jogada registrada com sucesso"
   ❌ Erro: "row-level security policy" → Execute fix_rls_policies.sql
   ```

### Teste 2: Verificar Banco de Dados
No Supabase Dashboard → Table Editor:

1. **historico_jogadas**: Deve ter novos registros
2. **perfis**: Pontos devem aumentar
3. **ranking_familia**: Deve ser atualizado

### Teste 3: Verificar Ranking no App
1. Volte ao menu principal
2. Vá em "Ranking Familiar"
3. Os pontos devem estar atualizados
4. A precisão deve ser calculada

---

## 📊 Estrutura das Tabelas

### perfis
```sql
id UUID PRIMARY KEY
nome_integrante TEXT
avatar TEXT
token_familiar TEXT
pontos INTEGER                 -- Atualizado automaticamente
precisao DECIMAL(5,2)         -- Calculado automaticamente
tempo_resposta_medio DECIMAL  -- Calculado automaticamente
total_jogadas INTEGER         -- Incrementado automaticamente
desempenho_por_dificuldade JSONB
```

### historico_jogadas
```sql
id UUID PRIMARY KEY
jogador_id UUID               -- Referência ao perfil
jogo TEXT                     -- 'quiz', 'sorting', etc.
nivel INTEGER                 -- 1-10
acerto BOOLEAN               
tempo_resposta DECIMAL
pontuacao INTEGER            -- Pontos desta jogada
dificuldade TEXT             -- 'Fácil', 'Médio', 'Difícil'
dados_adicionais JSONB       -- Dados específicos do jogo
timestamp TIMESTAMP
```

### ranking_familia
```sql
id UUID PRIMARY KEY
token_familiar TEXT
nome_familia TEXT
integrante_id UUID           -- Referência ao perfil
pontuacao_total INTEGER      -- Atualizado pelo trigger
ultima_jogada TIMESTAMP      -- Atualizada pelo trigger
```

---

## 🔐 Políticas RLS Aplicadas

### Tabela: perfis
```sql
✅ SELECT - Todos podem ler
✅ INSERT - Todos podem criar
✅ UPDATE - Todos podem atualizar
```

### Tabela: historico_jogadas
```sql
✅ SELECT - Todos podem ler
✅ INSERT - Todos podem criar
```

### Tabela: ranking_familia
```sql
✅ SELECT - Todos podem ler
✅ INSERT - Necessário para triggers (CORRIGIDO)
✅ UPDATE - Necessário para triggers (CORRIGIDO)
```

---

## 📁 Arquivos de Referência

### Código do Aplicativo
- `/components/QuizGame.tsx` - Quiz com pontuação
- `/components/SortingGame.tsx` - Separação com pontuação
- `/components/MemoryGame.tsx` - Memória com pontuação
- `/components/RouteGame.tsx` - Rota com pontuação
- `/components/CompostingGame.tsx` - Compostagem com pontuação
- `/components/FamilyRanking.tsx` - Exibição do ranking

### Banco de Dados
- `/supabase/schema.sql` - Schema completo atualizado
- `/supabase/fix_rls_policies.sql` - Correção isolada de RLS
- `/lib/supabaseClient.ts` - Cliente Supabase

### Documentação
- `/CORRECAO_PONTUACAO.md` - Detalhes técnicos da correção de pontuação
- `/CORRECAO_RLS.md` - Guia de correção do RLS
- `/INICIO_RAPIDO.md` - Guia de início rápido

---

## ✅ Checklist Final

Após aplicar todas as correções:

- [ ] Jogos salvam no banco de dados
- [ ] Não há erro de "row-level security"
- [ ] Pontos aparecem no ranking
- [ ] Precisão é calculada corretamente
- [ ] Total de jogadas incrementa
- [ ] Ranking atualiza em tempo real
- [ ] Triggers funcionam automaticamente
- [ ] Console não mostra erros

---

## 🆘 Troubleshooting

### Erro: "row-level security policy"
👉 Execute `/supabase/fix_rls_policies.sql`

### Pontos não aparecem
1. Verifique no console se há erros
2. Verifique no Supabase Table Editor se há dados em `historico_jogadas`
3. Execute: `SELECT * FROM perfis;` e veja se `pontos` está aumentando
4. Verifique se os triggers existem: `SELECT * FROM pg_trigger WHERE tgname LIKE '%ranking%';`

### Ranking não atualiza
1. Recarregue a página (F5)
2. Verifique `ranking_familia` no Table Editor
3. Execute manualmente: `SELECT * FROM obter_ranking_familia('SEU_TOKEN');`

### Nenhum dado aparece
1. Confirme que executou o `schema.sql` completo
2. Confirme que as credenciais do Supabase estão corretas
3. Verifique se há conexão com internet

---

## 🎉 Resultado Final

Com todas as correções aplicadas:

✅ **Sistema de pontuação totalmente funcional**
- Jogos salvam automaticamente no banco
- Triggers atualizam estatísticas em tempo real
- Ranking familiar funciona perfeitamente
- Métricas detalhadas para análise

✅ **Persistência real de dados**
- Dados não se perdem ao recarregar
- Múltiplos jogadores na mesma família
- Histórico completo de jogadas

✅ **Pronto para uso educacional**
- 5 minigames funcionais
- Sistema de ranking motivacional
- Análise de desempenho por dificuldade
