
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
      <div className="bg-[#f5f0e0] bg-opacity-90 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">WELCOME TO CHECKER GAME</h1>
        
        <p className="text-center text-gray-800 mb-6">Choose your game mode:</p>
        
        <div className="flex flex-col gap-4 mb-6">
          <Button 
            onClick={() => startNewGame('two-player')}
            className="bg-[#553c20] hover:bg-[#422e1a] text-white text-lg py-3"
          >
            Two Player game
          </Button>
          
          <Button 
            onClick={() => startNewGame('single')}
            className="bg-[#553c20] hover:bg-[#422e1a] text-white text-lg py-3"
          >
            Play with AI (on PC)
          </Button>
        </div>
        
        {/* AI difficulty selection - hidden by default */}
        <div className="mb-4 hidden">
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
        
        <p className="text-center text-gray-700 mt-4">
          Made with ❤️ by Ben Asmah.
        </p>
      </div>
    </div>
  );
};

export default GameSetup;
