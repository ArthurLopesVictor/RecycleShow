/**
 * Funções compartilhadas entre os minigames
 * Aqui ficam todas as utilidades que evitam código duplicado
 */

import { supabaseClient } from './supabaseClient';

// ===== CONSTANTES =====

// Lista de avatares disponíveis pro usuário escolher
export const AVATARS = ['👨', '👩', '👦', '👧', '🧑', '👴', '👵', '🧒', '🧕', '👨‍🦰', '👩‍🦰', '👨‍🦱'];

// Precisa de 90% pra passar de nível
export const PASSING_PERCENTAGE = 90;

// ===== TIPOS DE DADOS =====

// Estrutura de uma jogada que ainda não foi salva no banco
export interface PendingMove {
  acerto: boolean;              // Acertou ou errou?
  tempo_resposta: number;       // Quanto tempo levou (em segundos)
  pontuacao: number;            // Quantos pontos ganhou
  dados_adicionais: Record<string, any>;  // Informações extras específicas de cada jogo
}

// Tipos de minigames que temos
export type GameType = 'quiz' | 'sorting' | 'route' | 'memory' | 'composting';

// Níveis de dificuldade
export type DifficultyLevel = 'Fácil' | 'Médio' | 'Difícil';

// ===== FUNÇÕES UTILITÁRIAS =====

// Embaralha um array usando o algoritmo Fisher-Yates
// É tipo sortear cartas e ir distribuindo aleatoriamente
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calcula a porcentagem de acertos
// Ex: 8 acertos em 10 perguntas = 80%
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return (correct / total) * 100;
}

// Verifica se o jogador passou no nível (90% ou mais)
export function hasPassed(correct: number, total: number): boolean {
  return calculatePercentage(correct, total) >= PASSING_PERCENTAGE;
}

// Converte número de dificuldade (1-10) para texto legível
// Níveis 1-3 = Fácil, 4-7 = Médio, 8-10 = Difícil
export function getDifficultyLevel(difficulty: number): DifficultyLevel {
  if (difficulty <= 3) return 'Fácil';
  if (difficulty <= 7) return 'Médio';
  return 'Difícil';
}

// Salva todas as jogadas pendentes no banco de dados de uma vez
// Isso é mais eficiente do que salvar uma por uma
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

// Limpa os dados de sessão do localStorage
// Usado quando o usuário faz logout
export function clearSessionData(): void {
  localStorage.removeItem('recycle_token_familiar');
  localStorage.removeItem('recycle_current_player_id');
}

// Gera um número aleatório entre min e max (inclusivo)
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Formata tempo em segundos para formato MM:SS
// Ex: 125 segundos vira "2:05"
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}