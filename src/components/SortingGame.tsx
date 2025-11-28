import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Trophy } from 'lucide-react';
import { wasteItems, WasteItem } from '../lib/mockData';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'motion/react';
import { usePlayerSupabase } from './PlayerContextSupabase';
import { shuffleArray } from '../lib/gameUtils';
import { usePendingMoves } from '../lib/usePendingMoves';
import { GameOverScreen } from './GameOverScreen';

interface SortingGameProps {
  onBack: () => void;
  difficulty: number; // 1-10
}

const binColors = {
  green: { bg: '#22c55e', name: 'Verde - Vidro/Orgânico' },
  blue: { bg: '#3b82f6', name: 'Azul - Papel' },
  yellow: { bg: '#eab308', name: 'Amarelo - Metal' },
  red: { bg: '#ef4444', name: 'Vermelho - Plástico' },
  gray: { bg: '#6b7280', name: 'Cinza - Rejeitos' }
};

interface DraggableItemProps {
  item: WasteItem;
  onDrop: () => void;
}

function DraggableItem({ item, onDrop }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'waste',
    item: { id: item.id, correctBin: item.correctBin },
    end: (draggedItem, monitor) => {
      if (monitor.didDrop()) {
        onDrop();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <motion.div
      ref={drag}
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.3 }}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-all">
        <p className="text-center">{item.name}</p>
      </div>
    </motion.div>
  );
}

interface BinProps {
  color: keyof typeof binColors;
  onDrop: (itemId: string, correctBin: string) => void;
}

function Bin({ color, onDrop }: BinProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'waste',
    drop: (item: { id: string; correctBin: string }) => {
      onDrop(item.id, item.correctBin);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`rounded-xl p-6 min-h-32 flex flex-col items-center justify-center transition-all ${
        isOver ? 'ring-4 ring-white scale-105' : ''
      }`}
      style={{ backgroundColor: binColors[color].bg }}
    >
      <div className="text-4xl mb-2">🗑️</div>
      <p className="text-white text-center text-sm">{binColors[color].name}</p>
    </div>
  );
}

function SortingGameContent({ onBack, difficulty }: SortingGameProps) {
  const { currentPlayer } = usePlayerSupabase();
  const [items, setItems] = useState<WasteItem[]>([]);
  const [currentItem, setCurrentItem] = useState<WasteItem | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({
    type: null,
    message: ''
  });
  const [startTime, setStartTime] = useState(Date.now());
  const [gameOver, setGameOver] = useState(false);
  
  const totalItems = 5;
  const { addMove, clearMoves } = usePendingMoves(gameOver, currentPlayer.id, 'sorting', difficulty);

  const initializeGame = () => {
    const filtered = wasteItems.filter(item => item.difficulty === difficulty);
    const shuffled = shuffleArray(filtered);
    const selected = shuffled.slice(0, 5);
    setItems(selected);
    setCurrentItem(selected[0]);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const handleBinDrop = async (itemId: string, correctBin: string, selectedBin: keyof typeof binColors) => {
    if (!currentItem) return;
    
    const isCorrect = correctBin === selectedBin;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Armazenar jogada localmente (não salvar no banco ainda)
    addMove({
      acerto: isCorrect,
      tempo_resposta: timeSpent,
      pontuacao: isCorrect ? 20 : 0,
      dados_adicionais: {
        itemId: itemId,
        itemName: currentItem.name,
        selectedBin: selectedBin,
        correctBin: correctBin
      }
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback({ type: 'correct', message: 'Parabéns! Escolha correta! 🎉' });
    } else {
      setFeedback({ type: 'incorrect', message: `Ops! ${currentItem?.name} vai na lixeira ${binColors[correctBin as keyof typeof binColors].name}` });
    }

    setAttempts(prev => prev + 1);

    setTimeout(() => {
      setFeedback({ type: null, message: '' });
      const nextIndex = items.findIndex(item => item.id === itemId) + 1;
      
      if (nextIndex < items.length) {
        setCurrentItem(items[nextIndex]);
        setStartTime(Date.now());
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const handleRestart = () => {
    initializeGame();
    setScore(0);
    setAttempts(0);
    setFeedback({ type: null, message: '' });
    setStartTime(Date.now());
    setGameOver(false);
    clearMoves();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <GameOverScreen
          score={score}
          total={totalItems}
          title="Separação Concluída!"
          description="Veja seu desempenho"
          gradientFrom="green-400"
          gradientTo="blue-500"
          onRestart={handleRestart}
          onBack={onBack}
          customMessage={{
            passed: 'Excelente! Você domina a separação de resíduos!',
            failed: 'Continue praticando! Você precisa de 90% para avançar.'
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-5xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Badge className="bg-green-600">
              Item {attempts + 1}/{totalItems}
            </Badge>
            <Badge variant="outline">
              Nível {difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Trophy className="w-5 h-5" />
            <span className="text-xl">{score} pontos</span>
          </div>
        </div>

        {/* Progress */}
        <Progress value={(attempts / totalItems) * 100} className="mb-6" />

        {/* Feedback */}
        {feedback.type && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              feedback.type === 'correct' ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
            }`}
          >
            <p className={`text-center ${feedback.type === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
              {feedback.message}
            </p>
          </motion.div>
        )}

        {/* Current Item */}
        {currentItem && !feedback.type && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Arraste o item para a lixeira correta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <DraggableItem 
                    item={currentItem} 
                    onDrop={() => {}}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bins */}
        <Card>
          <CardHeader>
            <CardTitle>Lixeiras</CardTitle>
            <CardDescription>Arraste o item para a lixeira apropriada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(binColors).map(([color]) => (
                <Bin
                  key={color}
                  color={color as keyof typeof binColors}
                  onDrop={(itemId, correctBin) => handleBinDrop(itemId, correctBin, color as keyof typeof binColors)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            💡 Dica: Clique e arraste o item até a lixeira da cor correta!
          </p>
        </div>
      </div>
    </div>
  );
}

export function SortingGame(props: SortingGameProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <SortingGameContent {...props} />
    </DndProvider>
  );
}