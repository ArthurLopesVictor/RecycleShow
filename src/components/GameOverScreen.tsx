import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trophy, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { calculatePercentage, hasPassed } from '../lib/gameUtils';

// Informações que a tela de game over precisa receber
interface GameOverScreenProps {
  score: number;
  total: number;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  onRestart: () => void;
  onBack: () => void;
  customStats?: React.ReactNode;
  customMessage?: {
    passed: string;
    failed: string;
  };
}

// Tela que aparece quando o jogador termina um minigame
// Mostra pontuação, se passou ou não, e opções pra jogar de novo ou voltar ao menu
export function GameOverScreen({
  score,
  total,
  title,
  description,
  gradientFrom,
  gradientTo,
  onRestart,
  onBack,
  customStats,
  customMessage
}: GameOverScreenProps) {
  // Calcula a porcentagem de acertos
  const percentage = Math.round(calculatePercentage(score, total));
  // Verifica se passou (precisa de 90% ou mais)
  const passed = hasPassed(score, total);

  // Mensagem padrão que aparece dependendo se passou ou não
  const defaultMessage = {
    passed: 'Parabéns! Você desbloqueou o próximo nível!',
    failed: `Quase lá! Você precisa de 90% para avançar.`
  };

  const message = customMessage || defaultMessage;

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`}>
      {/* Animação suave quando a tela aparece */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="text-center">
          <CardHeader>
            {/* Troféu no topo com as cores do jogo */}
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-${gradientFrom} to-${gradientTo} flex items-center justify-center`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Porcentagem grande e chamativa */}
            <div>
              <div className="text-6xl mb-2">{percentage}%</div>
              <p className="text-gray-600">
                {score} de {total} corretas
              </p>
            </div>

            {/* Box colorido mostrando se passou ou não */}
            <div className={`p-4 rounded-lg ${passed ? 'bg-green-100' : 'bg-orange-100'}`}>
              {passed ? (
                <>
                  {/* Check verde se passou */}
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800">{message.passed}</p>
                </>
              ) : (
                <>
                  {/* X laranja se não passou */}
                  <XCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-orange-800">{message.failed}</p>
                </>
              )}
            </div>

            {/* Área para estatísticas customizadas (usado por alguns jogos) */}
            {customStats}

            {/* Botões para jogar de novo ou voltar */}
            <div className="flex gap-3">
              <Button onClick={onRestart} className={`flex-1 bg-${gradientFrom} hover:bg-${gradientFrom}/90`}>
                Jogar Novamente
              </Button>
              <Button onClick={onBack} variant="outline" className="flex-1">
                Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}