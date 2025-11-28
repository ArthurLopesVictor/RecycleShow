/**
 * Utilitários compartilhados entre os minigames
 * Aplicando princípios DRY (Don't Repeat Yourself)
 */

import { supabaseClient } from './supabaseClient';

// ==================== CONSTANTES ====================

export const AVATARS = ['👨', '👩', '👦', '👧', '🧑', '👴', '👵', '🧒', '🧕', '👨‍🦰', '👩‍🦰', '👨‍🦱'];

export const PASSING_PERCENTAGE = 90;

// ==================== TIPOS ====================

export interface PendingMove {
  acerto: boolean;
  tempo_resposta: number;
  pontuacao: number;
  dados_adicionais: Record<string, any>;
}

export type GameType = 'quiz' | 'sorting' | 'route' | 'memory' | 'composting';

export type DifficultyLevel = 'Fácil' | 'Médio' | 'Difícil';

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Embaralha um array usando o algoritmo Fisher-Yates
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calcula a porcentagem de acertos
 */
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return (correct / total) * 100;
}

/**
 * Verifica se o jogador passou no nível (90% ou mais)
 */
export function hasPassed(correct: number, total: number): boolean {
  return calculatePercentage(correct, total) >= PASSING_PERCENTAGE;
}

/**
 * Converte número de dificuldade (1-10) para texto
 */
export function getDifficultyLevel(difficulty: number): DifficultyLevel {
  if (difficulty <= 3) return 'Fácil';
  if (difficulty <= 7) return 'Médio';
  return 'Difícil';
}

/**
 * Salva todas as jogadas pendentes no banco de dados
 */
export async function savePendingMoves(
  moves: PendingMove[],
  playerId: string,
  gameType: GameType,
  difficulty: number
): Promise<void> {
  if (moves.length === 0) return;

  try {
    for (const move of moves) {
      await supabaseClient.registrarJogada({
        jogador_id: playerId,
        jogo: gameType,
        nivel: difficulty,
        acerto: move.acerto,
        tempo_resposta: move.tempo_resposta,
        pontuacao: move.pontuacao,
        dificuldade: getDifficultyLevel(difficulty),
        dados_adicionais: move.dados_adicionais
      });
    }
    console.log(`✅ ${moves.length} jogadas salvas com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao salvar jogadas:', error);
    throw error;
  }
}

/**
 * Limpa dados de sessão do localStorage
 */
export function clearSessionData(): void {
  localStorage.removeItem('recycle_token_familiar');
  localStorage.removeItem('recycle_current_player_id');
}

/**
 * Gera um número aleatório entre min e max (inclusivo)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formata tempo em segundos para formato MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
