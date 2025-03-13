
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
        <h1 className="text-5xl font-bold text-board-dark font-playfair drop-shadow-md mb-2 bg-gradient-to-b from-amber-700 to-amber-500 bg-clip-text text-transparent">
          International Checkers
        </h1>
        <p className="text-lg text-gray-700 italic">Classic Strategy, Modern Challenge</p>
      </div>
      <div className="flex flex-col gap-6 max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md border border-amber-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-800">
            <Crown className="mr-2" /> Difficulty Level
          </h2>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setDifficultyLevel('beginner')}
              variant={difficultyLevel === 'beginner' ? 'default' : 'outline'}
              className={`w-full justify-start group transition-all duration-200 ${
                difficultyLevel === 'beginner' 
                  ? 'bg-board-dark text-white hover:bg-board-dark/90' 
                  : 'bg-board-light/30 border-board-dark/30 text-board-dark hover:bg-board-light/50'
              }`}
            >
              <div className="flex items-center">
                <Circle className={`mr-2 ${difficultyLevel === 'beginner' ? 'text-white' : 'text-piece-dark'}`} />
                <span>Beginner</span>
              </div>
              {difficultyLevel === 'beginner' && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">Selected</span>
              )}
            </Button>
            <Button 
              onClick={() => setDifficultyLevel('intermediate')}
              variant={difficultyLevel === 'intermediate' ? 'default' : 'outline'}
              className={`w-full justify-start group transition-all duration-200 ${
                difficultyLevel === 'intermediate' 
                  ? 'bg-board-dark text-white hover:bg-board-dark/90' 
                  : 'bg-board-light/30 border-board-dark/30 text-board-dark hover:bg-board-light/50'
              }`}
            >
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Circle className={`${difficultyLevel === 'intermediate' ? 'text-white' : 'text-piece-dark'}`} />
                  <Circle className={`-ml-1 ${difficultyLevel === 'intermediate' ? 'text-white' : 'text-piece-dark'}`} />
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
              className={`w-full justify-start group transition-all duration-200 ${
                difficultyLevel === 'advanced' 
                  ? 'bg-board-dark text-white hover:bg-board-dark/90' 
                  : 'bg-board-light/30 border-board-dark/30 text-board-dark hover:bg-board-light/50'
              }`}
            >
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Circle className={`${difficultyLevel === 'advanced' ? 'text-white' : 'text-piece-dark'}`} />
                  <Circle className={`-ml-1 ${difficultyLevel === 'advanced' ? 'text-white' : 'text-piece-dark'}`} />
                  <Circle className={`-ml-1 ${difficultyLevel === 'advanced' ? 'text-white' : 'text-piece-dark'}`} />
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
              className={`w-full justify-start group transition-all duration-200 ${
                difficultyLevel === 'expert' 
                  ? 'bg-amber-800 text-white hover:bg-amber-800/90' 
                  : 'bg-board-light/30 border-board-dark/30 text-board-dark hover:bg-board-light/50'
              }`}
            >
              <div className="flex items-center">
                <Crown className={`mr-2 ${difficultyLevel === 'expert' ? 'text-yellow-300' : 'text-amber-700'}`} />
                <span>Expert</span>
              </div>
              {difficultyLevel === 'expert' && (
                <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">Selected</span>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Button 
            onClick={() => startNewGame('single')}
            className="py-6 text-lg bg-gradient-to-b from-board-dark to-board-dark/80 hover:from-board-dark/90 hover:to-board-dark/70 shadow-md border border-amber-100/20 transform transition-all duration-200 hover:scale-105"
            variant="default"
          >
            <div className="flex items-center">
              <Circle className="mr-2 text-piece-light" />
              <span>Single Player</span>
            </div>
          </Button>
          <Button 
            onClick={() => startNewGame('two-player')}
            className="py-6 text-lg bg-gradient-to-b from-amber-800 to-amber-700 hover:from-amber-800/90 hover:to-amber-700/80 shadow-md border border-amber-100/20 transform transition-all duration-200 hover:scale-105"
            variant="default"
          >
            <div className="flex items-center">
              <div className="flex mr-2">
                <Circle className="text-piece-light" />
                <Circle className="text-piece-light -ml-1" />
              </div>
              <span>Two Players</span>
            </div>
          </Button>
        </div>
      </div>
      
      <div className="mt-8 opacity-80 animate-pulse">
        <p className="text-sm text-amber-800 italic">Click a mode to begin your journey</p>
      </div>
    </div>
  );
};

export default GameSetup;
