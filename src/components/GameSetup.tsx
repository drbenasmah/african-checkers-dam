
import React from 'react';
import { Brain } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DifficultyLevel } from '@/lib/aiService';

interface GameSetupProps {
  difficultyLevel: DifficultyLevel;
  setDifficultyLevel: (level: DifficultyLevel) => void;
  startNewGame: (mode: 'single' | 'two-player') => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ 
  difficultyLevel, 
  setDifficultyLevel, 
  startNewGame 
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <h1 className="text-4xl font-bold text-white mb-8">International Checkers</h1>
      <div className="flex flex-col gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Brain className="mr-2" /> AI Difficulty
          </h2>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => setDifficultyLevel('beginner')}
              variant={difficultyLevel === 'beginner' ? 'default' : 'outline'}
              className="w-full justify-start"
            >
              Beginner
            </Button>
            <Button 
              onClick={() => setDifficultyLevel('intermediate')}
              variant={difficultyLevel === 'intermediate' ? 'default' : 'outline'}
              className="w-full justify-start"
            >
              Intermediate
            </Button>
            <Button 
              onClick={() => setDifficultyLevel('advanced')}
              variant={difficultyLevel === 'advanced' ? 'default' : 'outline'}
              className="w-full justify-start"
            >
              Advanced
            </Button>
            <Button 
              onClick={() => setDifficultyLevel('expert')}
              variant={difficultyLevel === 'expert' ? 'default' : 'outline'}
              className="w-full justify-start"
            >
              Expert
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={() => startNewGame('single')}
          className="w-48 text-lg"
          variant="default"
        >
          Single Player
        </Button>
        <Button 
          onClick={() => startNewGame('two-player')}
          className="w-48 text-lg"
          variant="outline"
        >
          Two Players
        </Button>
      </div>
    </div>
  );
};

export default GameSetup;
