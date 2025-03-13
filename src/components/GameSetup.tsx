
import React from 'react';
import { Brain, Circle, CircleDot, CircleDashed, Crown } from "lucide-react";
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
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-board-dark font-playfair drop-shadow-md mb-2 bg-gradient-to-b from-board-dark to-board-dark/80 bg-clip-text text-transparent">
          International Checkers
        </h1>
        <p className="text-lg text-gray-600 italic">Classic Strategy, Modern Challenge</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Brain className="mr-2" /> AI Difficulty
          </h2>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => setDifficultyLevel('beginner')}
              variant={difficultyLevel === 'beginner' ? 'default' : 'outline'}
              className="w-full justify-start group transition-all duration-200"
            >
              <div className="flex items-center">
                <Circle className="mr-2 text-piece-dark" />
                <span>Beginner</span>
              </div>
              {difficultyLevel === 'beginner' && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">Selected</span>
              )}
            </Button>
            <Button 
              onClick={() => setDifficultyLevel('intermediate')}
              variant={difficultyLevel === 'intermediate' ? 'default' : 'outline'}
              className="w-full justify-start group transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Circle className="text-piece-dark" />
                  <Circle className="text-piece-dark -ml-1" />
                </div>
                <span>Intermediate</span>
              </div>
              {difficultyLevel === 'intermediate' && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">Selected</span>
              )}
            </Button>
            <Button 
              onClick={() => setDifficultyLevel('advanced')}
              variant={difficultyLevel === 'advanced' ? 'default' : 'outline'}
              className="w-full justify-start group transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Circle className="text-piece-dark" />
                  <Circle className="text-piece-dark -ml-1" />
                  <Circle className="text-piece-dark -ml-1" />
                </div>
                <span>Advanced</span>
              </div>
              {difficultyLevel === 'advanced' && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">Selected</span>
              )}
            </Button>
            <Button 
              onClick={() => setDifficultyLevel('expert')}
              variant={difficultyLevel === 'expert' ? 'default' : 'outline'}
              className="w-full justify-start group transition-all duration-200"
            >
              <div className="flex items-center">
                <Crown className="mr-2 text-piece-dark" />
                <span>Expert</span>
              </div>
              {difficultyLevel === 'expert' && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">Selected</span>
              )}
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={() => startNewGame('single')}
          className="w-48 text-lg bg-board-dark hover:bg-board-dark/80"
          variant="default"
        >
          Single Player
        </Button>
        <Button 
          onClick={() => startNewGame('two-player')}
          className="w-48 text-lg border-board-dark text-board-dark hover:bg-board-dark/10"
          variant="outline"
        >
          Two Players
        </Button>
      </div>
    </div>
  );
};

export default GameSetup;
