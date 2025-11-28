# Correção: Progresso e Perfil do Jogador

## Problemas Corrigidos

### 1. ❌ Porcentagem não aparece para seguir para próxima fase

**Problema:** Quando o jogador terminava um minigame, a porcentagem de acerto era mostrada, mas os níveis subsequentes não eram desbloqueados automaticamente.

**Causa Raiz:**
- Os minigames salvavam dados no Supabase ✅
- Mas o sistema de desbloqueio de níveis verificava o `localStorage` ❌
- As funções `getPlayerProgress()` e `isPlayerLevelUnlocked()` liam do `localStorage`, não do Supabase

**Solução Aplicada:**

#### A. Novas funções no `supabaseClient.ts`

Foram adicionadas 3 novas funções para gerenciar progresso via Supabase:

```typescript
// 1. Obter progresso de um jogo específico
async obterProgressoJogo(jogadorId: string, jogo: string): Promise<Record<number, number>>

// 2. Verificar se nível está desbloqueado
async verificarNivelDesbloqueado(jogadorId: string, jogo: string, nivel: number): Promise<boolean>

// 3. Obter progresso completo de todos os jogos
async obterProgressoCompleto(jogadorId: string): Promise<{ quiz: {...}, sorting: {...}, ... }>
```

**Como funciona:**
- `obterProgressoJogo`: Agrupa o histórico de jogadas por nível e calcula porcentagem de acertos
- `verificarNivelDesbloqueado`: Retorna `true` se o nível anterior foi completado com ≥90%
- `obterProgressoCompleto`: Busca progresso de todos os 5 minigames de uma vez

#### B. Atualização do `Minigames.tsx`

O componente agora:

1. **Carrega progresso do Supabase** quando monta:
```typescript
useEffect(() => {
  const loadProgress = async () => {
    const progressData = await supabaseClient.obterProgressoCompleto(currentPlayer.id);
    setProgress(progressData);
    // Calcula quais níveis estão bloqueados
  };
  loadProgress();
}, [currentPlayer.id]);
```

2. **Recarrega progresso após completar um jogo**:
```typescript
const handleGameComplete = async () => {
  setSelectedGame({ type: null, difficulty: 1 });
  // Recarregar progresso do Supabase
  const progressData = await supabaseClient.obterProgressoCompleto(currentPlayer.id);
  setProgress(progressData);
  // Recalcular níveis bloqueados
};
```

3. **Usa as novas funções** em vez das antigas:
   - ❌ Antes: `isPlayerLevelUnlocked(currentPlayer.id, 'quiz', level)`
   - ✅ Agora: `lockedLevels.quiz.has(level)` (calculado via Supabase)

#### C. Padronização do MemoryGame

O jogo da memória agora:
- ✅ Mostra **porcentagem** em vez de apenas pontos
- ✅ Mostra mensagem de desbloqueio "Você desbloqueou o próximo nível!"
- ✅ Consistente com os outros 4 minigames

**Antes:**
```typescript
<div className="text-6xl mb-2">{score}</div>
<p className="text-gray-600">Pontos</p>
```

**Depois:**
```typescript
<div className="text-6xl mb-2">{Math.round(percentage)}%</div>
<p className="text-gray-600">{matches} de {pairCount} pares encontrados</p>

<div className={`p-4 rounded-lg ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
  {passed ? (
    <p className="text-green-800">
      Excelente! Você desbloqueou o próximo nível!
    </p>
  ) : (
    <p className="text-orange-800">
      Continue praticando! Você precisa de 90% para avançar.
    </p>
  )}
</div>
```

---

### 2. ❌ No perfil não aparece o desempenho por dificuldade

**Problema:** A seção "Desempenho por Dificuldade" no perfil não mostrava dados, ficava em branco.

**Causa Raiz:**
- `UserProfile.tsx` usava `getMetrics()` do `mockData.ts`
- Essa função lia do `localStorage`
- Como os dados estavam no Supabase, nada era exibido

**Solução Aplicada:**

#### Atualização do `UserProfile.tsx`

1. **Carregar histórico do Supabase:**
```typescript
const [metrics, setMetrics] = useState<HistoricoJogada[]>([]);

useEffect(() => {
  const loadMetrics = async () => {
    const historico = await supabaseClient.obterHistoricoJogador(user.id, 1000);
    setMetrics(historico);
  };
  loadMetrics();
}, [user?.id]);
```

2. **Calcular desempenho por dificuldade:**
```typescript
metrics.forEach(m => {
  let category: 'easy' | 'medium' | 'hard' = 'easy';
  
  // Usar coluna 'dificuldade' do banco
  if (m.dificuldade === 'Fácil') category = 'easy';
  else if (m.dificuldade === 'Médio') category = 'medium';
  else if (m.dificuldade === 'Difícil') category = 'hard';
  
  performanceByDifficulty[category].total++;
  if (m.acerto) performanceByDifficulty[category].correct++;
});
```

3. **Exportação de dados adaptada:**
   - Agora usa `supabaseClient.exportarHistoricoJSON()` e `supabaseClient.downloadHistorico()`
   - Busca dados diretamente do banco

---

## Resumo das Mudanças

### Arquivos Modificados

1. **`/lib/supabaseClient.ts`**
   - ✅ Adicionadas 3 funções de progresso/desbloqueio
   - ✅ Calculam porcentagem de acertos por nível
   - ✅ Verificam desbloqueio baseado em 90% de acerto

2. **`/components/Minigames.tsx`**
   - ✅ Carrega progresso do Supabase ao montar
   - ✅ Recarrega progresso após completar jogo
   - ✅ Calcula níveis bloqueados via Supabase
   - ✅ Mostra loading enquanto carrega dados

3. **`/components/MemoryGame.tsx`**
   - ✅ Mostra porcentagem em vez de pontos
   - ✅ Mostra mensagem de desbloqueio
   - ✅ Padronizado com outros minigames

4. **`/components/UserProfile.tsx`**
   - ✅ Busca histórico do Supabase
   - ✅ Calcula desempenho por dificuldade corretamente
   - ✅ Exportação de dados via Supabase
   - ✅ Mostra loading enquanto carrega

---

## Como Funciona Agora

### Fluxo de Desbloqueio de Níveis

```
1. Jogador completa um nível
   ↓
2. Jogo salva resultado no Supabase via registrarJogada()
   ↓
3. Ao voltar ao menu, Minigames.tsx chama obterProgressoCompleto()
   ↓
4. Sistema calcula porcentagem de acertos por nível
   ↓
5. Níveis com ≥90% desbloqueiam o próximo
   ↓
6. UI atualiza automaticamente mostrando níveis desbloqueados
```

### Fluxo de Exibição do Perfil

```
1. UserProfile carrega histórico via obterHistoricoJogador()
   ↓
2. Agrupa jogadas por dificuldade (Fácil/Médio/Difícil)
   ↓
3. Calcula estatísticas (acertos, total, porcentagem)
   ↓
4. Exibe barras de progresso e métricas
   ↓
5. Permite exportar dados JSON/CSV
```

---

## Próximos Passos

Para que tudo funcione perfeitamente, certifique-se de que:

1. ✅ O arquivo SQL `schema.sql` foi executado no Supabase
2. ✅ O arquivo `fix_rls_policies.sql` foi executado (para os triggers funcionarem)
3. ✅ Você está conectado ao banco de dados
4. ✅ Há jogadas registradas no banco para ver o progresso

---

## Testando

### Teste 1: Desbloqueio de Níveis
1. Jogue o nível 1 de qualquer minigame
2. Acerte pelo menos 90% das questões/itens
3. Volte ao menu de minigames
4. O nível 2 deve estar desbloqueado ✅

### Teste 2: Perfil
1. Jogue alguns minigames (diferentes níveis)
2. Vá para a aba "Perfil"
3. Deve ver:
   - Estatísticas gerais (pontos, precisão, jogadas)
   - Desempenho por dificuldade (barras com porcentagem)
   - Conquistas desbloqueadas
   - Opções de exportação de dados

### Teste 3: MemoryGame
1. Jogue o Jogo da Memória
2. Complete o jogo
3. Deve ver:
   - Porcentagem de acerto (XX%)
   - Mensagem de desbloqueio se ≥90%
   - Opções de jogar novamente ou voltar ao menu

---

## ✨ Status: Correções Aplicadas

- ✅ Porcentagem aparece corretamente em todos os minigames
- ✅ Níveis desbloqueiam automaticamente após atingir 90%
- ✅ Perfil mostra desempenho por dificuldade
- ✅ MemoryGame padronizado com os outros jogos
- ✅ Todos os dados vêm do Supabase
- ✅ Sistema de progresso totalmente funcional
