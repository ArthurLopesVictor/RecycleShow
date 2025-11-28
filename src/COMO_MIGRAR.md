# 🔄 Como Migrar do mockData para Supabase

## Visão Geral

Este guia mostra como migrar cada parte do sistema do `mockData.ts` para usar o banco de dados Supabase real.

## 📋 Checklist de Migração

- [ ] Autenticação (AuthScreen)
- [ ] Seleção de Jogador (PlayerContext)
- [ ] Registro de Jogadas (Minigames)
- [ ] Rankings (FamilyRanking)
- [ ] Perfil do Usuário (UserProfile)
- [ ] Exportação de Métricas

---

## 1. Autenticação (AuthScreen.tsx)

### Antes (mockData):
```typescript
import { mockFamilies } from '../lib/mockData';

// Criar família
const family = {
  id: generateId(),
  name: familyName,
  code: generateCode(),
  players: []
};
```

### Depois (Supabase):
```typescript
import { supabaseClient } from '../lib/supabaseClient';

// Criar família (gerar token)
const token = await supabaseClient.gerarTokenFamiliar();

// Criar primeiro membro
const perfil = await supabaseClient.criarPerfil(
  playerName,
  selectedAvatar,
  token
);

// Salvar no localStorage
localStorage.setItem('familyToken', token);
localStorage.setItem('currentPlayerId', perfil.id);
```

### Entrar em família existente:
```typescript
// Verificar se token existe
const existe = await supabaseClient.tokenFamiliarExiste(familyCode);

if (existe) {
  // Buscar ou criar perfil
  let perfil = await supabaseClient.buscarPerfilPorNome(playerName, familyCode);
  
  if (!perfil) {
    perfil = await supabaseClient.criarPerfil(playerName, selectedAvatar, familyCode);
  }
  
  localStorage.setItem('familyToken', familyCode);
  localStorage.setItem('currentPlayerId', perfil.id);
}
```

---

## 2. Contexto de Jogador (PlayerContext.tsx)

### Antes (mockData):
```typescript
const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
const [family, setFamily] = useState<Family | null>(null);
```

### Depois (Supabase):
```typescript
import { supabaseClient, Perfil } from '../lib/supabaseClient';

const [currentPlayer, setCurrentPlayer] = useState<Perfil | null>(null);
const [familyMembers, setFamilyMembers] = useState<Perfil[]>([]);

// Carregar jogador atual
useEffect(() => {
  const loadPlayer = async () => {
    const playerId = localStorage.getItem('currentPlayerId');
    if (playerId) {
      const perfil = await supabaseClient.obterPerfil(playerId);
      setCurrentPlayer(perfil);
    }
  };
  loadPlayer();
}, []);

// Carregar membros da família
useEffect(() => {
  const loadFamily = async () => {
    const token = localStorage.getItem('familyToken');
    if (token) {
      const membros = await supabaseClient.obterMembrosFamilia(token);
      setFamilyMembers(membros);
    }
  };
  loadFamily();
}, []);

// Trocar jogador
const switchPlayer = async (playerId: string) => {
  const perfil = await supabaseClient.obterPerfil(playerId);
  setCurrentPlayer(perfil);
  localStorage.setItem('currentPlayerId', playerId);
};
```

---

## 3. Registro de Jogadas (Minigames)

### Antes (mockData):
```typescript
// QuizGame.tsx
const handleAnswer = (answer: number) => {
  const correct = answer === question.correctAnswer;
  const points = correct ? 100 : 0;
  
  // Atualizar pontos localmente
  setScore(score + points);
};
```

### Depois (Supabase):
```typescript
import { supabaseClient } from '../lib/supabaseClient';

const handleAnswer = async (answer: number) => {
  const correct = answer === question.correctAnswer;
  const points = correct ? 100 : 0;
  const endTime = Date.now();
  const timeSpent = (endTime - startTime) / 1000; // segundos
  
  // Registrar jogada no banco
  await supabaseClient.registrarJogada({
    jogador_id: currentPlayer!.id,
    jogo: 'quiz',
    nivel: currentLevel,
    acerto: correct,
    tempo_resposta: timeSpent,
    pontuacao: points,
    dificuldade: difficulty, // 'Fácil', 'Médio', 'Difícil'
    dados_adicionais: {
      pergunta_id: question.id,
      resposta_dada: answer,
      resposta_correta: question.correctAnswer
    }
  });
  
  // Atualizar estado local
  setScore(score + points);
  
  // Recarregar perfil para pegar stats atualizadas
  const perfilAtualizado = await supabaseClient.obterPerfil(currentPlayer!.id);
  setCurrentPlayer(perfilAtualizado);
};
```

### Aplicar em todos os 5 minigames:

#### SortingGame.tsx (Separação de Resíduos):
```typescript
await supabaseClient.registrarJogada({
  jogador_id: currentPlayer!.id,
  jogo: 'sorting',
  nivel: currentLevel,
  acerto: binCorrect,
  tempo_resposta: timeSpent,
  pontuacao: binCorrect ? 100 : 0,
  dificuldade: 'Médio',
  dados_adicionais: {
    item_id: item.id,
    bin_selecionada: selectedBin,
    bin_correta: item.correctBin
  }
});
```

#### MemoryGame.tsx (Jogo da Memória):
```typescript
await supabaseClient.registrarJogada({
  jogador_id: currentPlayer!.id,
  jogo: 'memory',
  nivel: currentLevel,
  acerto: allMatched,
  tempo_resposta: timeSpent,
  pontuacao: calculateScore(),
  dificuldade: 'Fácil',
  dados_adicionais: {
    tentativas: moves,
    pares_encontrados: matchedPairs
  }
});
```

#### RouteGame.tsx (Rota de Coleta):
```typescript
await supabaseClient.registrarJogada({
  jogador_id: currentPlayer!.id,
  jogo: 'route',
  nivel: currentLevel,
  acerto: routeOptimal,
  tempo_resposta: timeSpent,
  pontuacao: calculateScore(),
  dificuldade: 'Difícil',
  dados_adicionais: {
    pontos_coletados: collectedPoints.length,
    distancia_percorrida: totalDistance
  }
});
```

#### CompostingGame.tsx (Compostagem):
```typescript
await supabaseClient.registrarJogada({
  jogador_id: currentPlayer!.id,
  jogo: 'composting',
  nivel: currentLevel,
  acerto: compostCorrect,
  tempo_resposta: timeSpent,
  pontuacao: calculateScore(),
  dificuldade: 'Médio',
  dados_adicionais: {
    itens_compostaveis: correctItems,
    itens_incorretos: incorrectItems
  }
});
```

---

## 4. Rankings (FamilyRanking.tsx)

### Antes (mockData):
```typescript
import { mockFamilies } from '../lib/mockData';

const family = mockFamilies.find(f => f.code === familyCode);
const rankings = family.players.sort((a, b) => b.totalPoints - a.totalPoints);
```

### Depois (Supabase):
```typescript
import { supabaseClient } from '../lib/supabaseClient';

// Ranking da família
const [rankingFamiliar, setRankingFamiliar] = useState([]);

useEffect(() => {
  const loadRanking = async () => {
    const token = localStorage.getItem('familyToken');
    const ranking = await supabaseClient.obterRankingFamilia(token);
    setRankingFamiliar(ranking);
  };
  loadRanking();
}, []);

// Ranking global
const [rankingGlobal, setRankingGlobal] = useState([]);

useEffect(() => {
  const loadGlobalRanking = async () => {
    const ranking = await supabaseClient.obterRankingGlobal(100);
    setRankingGlobal(ranking);
  };
  loadGlobalRanking();
}, []);
```

---

## 5. Perfil do Usuário (UserProfile.tsx)

### Antes (mockData):
```typescript
const player = mockFamilies
  .flatMap(f => f.players)
  .find(p => p.id === playerId);
```

### Depois (Supabase):
```typescript
import { supabaseClient } from '../lib/supabaseClient';

const [perfil, setPerfil] = useState(null);
const [historico, setHistorico] = useState([]);

useEffect(() => {
  const loadProfile = async () => {
    const playerId = localStorage.getItem('currentPlayerId');
    
    // Carregar perfil
    const perfilData = await supabaseClient.obterPerfil(playerId);
    setPerfil(perfilData);
    
    // Carregar histórico
    const historicoData = await supabaseClient.obterHistoricoJogador(playerId, 50);
    setHistorico(historicoData);
  };
  loadProfile();
}, []);

// Exibir estatísticas por dificuldade
<div>
  <h3>Fácil: {perfil.desempenho_por_dificuldade.facil.precisao}%</h3>
  <h3>Médio: {perfil.desempenho_por_dificuldade.medio.precisao}%</h3>
  <h3>Difícil: {perfil.desempenho_por_dificuldade.dificil.precisao}%</h3>
</div>
```

---

## 6. Exportação de Métricas

### Antes (mockData):
```typescript
// Não implementado
```

### Depois (Supabase):
```typescript
import { supabaseClient } from '../lib/supabaseClient';

// Exportar CSV
const handleExportCSV = async () => {
  const playerId = localStorage.getItem('currentPlayerId');
  await supabaseClient.downloadHistorico(playerId, 'csv');
};

// Exportar JSON
const handleExportJSON = async () => {
  const playerId = localStorage.getItem('currentPlayerId');
  await supabaseClient.downloadHistorico(playerId, 'json');
};
```

---

## 🎯 Ordem Recomendada de Migração

1. **Autenticação** - Migre primeiro para criar/carregar famílias e jogadores
2. **Contexto de Jogador** - Centralize o estado do jogador atual
3. **Um Minigame** - Comece com o Quiz (mais simples)
4. **Teste Completo** - Garanta que funciona antes de continuar
5. **Demais Minigames** - Replique a lógica para os outros 4 jogos
6. **Rankings** - Migre a visualização de rankings
7. **Perfil** - Migre a página de perfil do usuário
8. **Exportação** - Adicione botões de exportar métricas

---

## ✅ Como Verificar se Está Funcionando

### Console do Navegador:
```javascript
// Testar conexão
import testarConexaoSupabase from './lib/testSupabase';
await testarConexaoSupabase();
```

### Supabase Dashboard:
1. Vá em **Table Editor**
2. Veja as tabelas `perfis`, `historico_jogadas`, `ranking_familia`
3. Confira se os dados estão sendo inseridos

### Frontend:
1. Crie uma nova família
2. Jogue um minigame
3. Verifique se os pontos aumentaram
4. Veja o ranking atualizado
5. Exporte os dados

---

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- **Causa:** Schema SQL não foi executado
- **Solução:** Execute `/supabase/schema.sql` no SQL Editor

### Erro: "Invalid API key"
- **Causa:** Credenciais incorretas
- **Solução:** Verifique `/utils/supabase/info.tsx`

### Dados não atualizam automaticamente
- **Causa:** Estado local não recarrega
- **Solução:** Chame `supabaseClient.obterPerfil()` após registrar jogada

### Ranking não aparece
- **Causa:** Nenhuma jogada foi registrada
- **Solução:** Registre pelo menos uma jogada para popular o ranking

---

## 📚 Recursos

- **Cliente Supabase:** `/lib/supabaseClient.ts`
- **Schema SQL:** `/supabase/schema.sql`
- **Testes:** `/lib/testSupabase.ts`
- **Documentação:** `/README.md`
- **Setup Rápido:** `/SETUP_RAPIDO.md`

---

**Dica:** Comece migrando um componente por vez e teste completamente antes de prosseguir.
