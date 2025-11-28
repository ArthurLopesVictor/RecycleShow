import { useState, useEffect } from 'react';
import { PendingMove, GameType, savePendingMoves } from './gameUtils';

/**
 * Hook customizado para gerenciar jogadas pendentes
 * Armazena jogadas localmente durante a sessão e salva no banco apenas quando o jogo termina
 */
export function usePendingMoves(
  gameOver: boolean,
  playerId: string,
  gameType: GameType,
  difficulty: number
) {
  const [pendingMoves, setPendingMoves] = useState<PendingMove[]>([]);

  // Salvar todas as jogadas quando o jogo terminar
  useEffect(() => {
    if (gameOver && pendingMoves.length > 0) {
      savePendingMoves(pendingMoves, playerId, gameType, difficulty);
    }
  }, [gameOver, pendingMoves, playerId, gameType, difficulty]);

  const addMove = (move: PendingMove) => {
    setPendingMoves(prev => [...prev, move]);
  };

  const clearMoves = () => {
    setPendingMoves([]);
  };

  return { pendingMoves, addMove, clearMoves };
}
