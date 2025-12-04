import { useState, useEffect } from 'react';
import { PendingMove, GameType, savePendingMoves } from './gameUtils';

// Hook customizado pra gerenciar jogadas pendentes
// A ideia aqui é guardar as jogadas na memória enquanto joga
// e só salvar tudo de uma vez no banco quando o jogo termina
// Isso é muito mais eficiente do que ficar fazendo requisição a cada jogada
export function usePendingMoves(
  gameOver: boolean,      // O jogo acabou?
  playerId: string,       // ID do jogador
  gameType: GameType,     // Qual jogo tá sendo jogado
  difficulty: number      // Nível de dificuldade (1-10)
) {
  // Lista de jogadas que ainda não foram salvas
  const [pendingMoves, setPendingMoves] = useState<PendingMove[]>([]);

  // Quando o jogo termina, salva todas as jogadas de uma vez
  useEffect(() => {
    if (gameOver && pendingMoves.length > 0) {
      savePendingMoves(pendingMoves, playerId, gameType, difficulty);
    }
  }, [gameOver, pendingMoves, playerId, gameType, difficulty]);

  // Adiciona uma nova jogada à lista
  const addMove = (move: PendingMove) => {
    setPendingMoves(prev => [...prev, move]);
  };

  // Limpa todas as jogadas pendentes (usado quando reinicia o jogo)
  const clearMoves = () => {
    setPendingMoves([]);
  };

  return { pendingMoves, addMove, clearMoves };
}
