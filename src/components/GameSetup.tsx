
import React, { useState, useEffect } from 'react';
import { Brain, Circle, CircleDot, CircleDashed, Crown } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DifficultyLevel } from '@/lib/aiService';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-4 gap-8 relative 
      bg-gradient-to-b from-amber-900/10 to-amber-50/10 
      before:content-[''] before:absolute before:inset-0 before:bg-[url('https://img.freepik.com/free-photo/wooden-floor-background_53876-88628.jpg')] before:bg-cover before:opacity-20 before:z-[-1]
      after:content-[''] after:absolute after:inset-0 after:bg-[repeating-conic-gradient(#00000008_0_deg,#00000008_90_deg,transparent_90_deg,transparent_180_deg)] after:bg-[length:40px_40px] after:z-[-1]
      ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
    >
      <div className="text-center mb-4 transform transition-all duration-500">
        <h1 className="text-5xl font-bold text-board-dark font-playfair mb-2 bg-gradient-to-b from-amber-800 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
          International Checkers
        </h1>
        <p className="text-lg text-amber-900/80 italic font-medium drop-shadow-sm">
          Classic Strategy, Modern Challenge
        </p>
      </div>
      
      <div className="flex flex-col gap-6 max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg border border-amber-200 transform hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-800 border-b pb-2 border-amber-200">
            <Crown className="mr-2" /> Difficulty Level
          </h2>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setDifficultyLevel('beginner')}
              variant={difficultyLevel === 'beginner' ? 'default' : 'outline'}
              className={`w-full justify-start group transition-all duration-300 hover:scale-[1.02] ${
                difficultyLevel === 'beginner' 
                  ? 'bg-gradient-to-r from-board-dark to-board-dark/90 text-white shadow-md hover:from-board-dark/95 hover:to-board-dark/85' 
                  : 'bg-board-light/40 border-board-dark/30 text-board-dark hover:bg-board-light/60'
              }`}
            >
              <div className="flex items-center">
                <Circle className={`mr-2 ${difficultyLevel === 'beginner' ? 'text-amber-200' : 'text-piece-dark'}`} />
                <span>Beginner</span>
              </div>
              {difficultyLevel === 'beginner' && (
                <span className="ml-auto text-xs bg-white/30 px-2 py-1 rounded-full shadow-inner">Selected</span>
              )}
            </Button>
            
            <Button 
              onClick={() => setDifficultyLevel('intermediate')}
              variant={difficultyLevel === 'intermediate' ? 'default' : 'outline'}
              className={`w-full justify-start group transition-all duration-300 hover:scale-[1.02] ${
                difficultyLevel === 'intermediate' 
                  ? 'bg-gradient-to-r from-board-dark to-board-dark/90 text-white shadow-md hover:from-board-dark/95 hover:to-board-dark/85' 
                  : 'bg-board-light/40 border-board-dark/30 text-board-dark hover:bg-board-light/60'
              }`}
            >
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Circle className={`${difficultyLevel === 'intermediate' ? 'text-amber-200' : 'text-piece-dark'}`} />
                  <Circle className={`-ml-1 ${difficultyLevel === 'intermediate' ? 'text-amber-200' : 'text-piece-dark'}`} />
                </div>
                <span>Intermediate</span>
              </div>
              {difficultyLevel === 'intermediate' && (
                <span className="ml-auto text-xs bg-white/30 px-2 py-1 rounded-full shadow-inner">Selected</span>
              )}
            </Button>
            
            <Button 
              onClick={() => setDifficultyLevel('advanced')}
              variant={difficultyLevel === 'advanced' ? 'default' : 'outline'}
              className={`w-full justify-start group transition-all duration-300 hover:scale-[1.02] ${
                difficultyLevel === 'advanced' 
                  ? 'bg-gradient-to-r from-board-dark to-board-dark/90 text-white shadow-md hover:from-board-dark/95 hover:to-board-dark/85' 
                  : 'bg-board-light/40 border-board-dark/30 text-board-dark hover:bg-board-light/60'
              }`}
            >
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Circle className={`${difficultyLevel === 'advanced' ? 'text-amber-200' : 'text-piece-dark'}`} />
                  <Circle className={`-ml-1 ${difficultyLevel === 'advanced' ? 'text-amber-200' : 'text-piece-dark'}`} />
                  <Circle className={`-ml-1 ${difficultyLevel === 'advanced' ? 'text-amber-200' : 'text-piece-dark'}`} />
                </div>
                <span>Advanced</span>
              </div>
              {difficultyLevel === 'advanced' && (
                <span className="ml-auto text-xs bg-white/30 px-2 py-1 rounded-full shadow-inner">Selected</span>
              )}
            </Button>
            
            <Button 
              onClick={() => setDifficultyLevel('expert')}
              variant={difficultyLevel === 'expert' ? 'default' : 'outline'}
              className={`w-full justify-start group transition-all duration-300 hover:scale-[1.02] ${
                difficultyLevel === 'expert' 
                  ? 'bg-gradient-to-r from-amber-800 to-amber-700 text-white shadow-md hover:from-amber-800/95 hover:to-amber-700/95' 
                  : 'bg-board-light/40 border-board-dark/30 text-board-dark hover:bg-board-light/60'
              }`}
            >
              <div className="flex items-center">
                <Crown className={`mr-2 ${difficultyLevel === 'expert' ? 'text-yellow-300 animate-pulse' : 'text-amber-700'}`} />
                <span>Expert</span>
              </div>
              {difficultyLevel === 'expert' && (
                <span className="ml-auto text-xs bg-white/30 px-2 py-1 rounded-full shadow-inner">Selected</span>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Button 
            onClick={() => startNewGame('single')}
            className="py-8 text-lg bg-gradient-to-b from-board-dark to-board-dark/80 hover:from-board-dark/90 hover:to-board-dark/70 shadow-md border border-amber-100/20 transform transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
            variant="default"
          >
            <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-photo/brown-wooden-textured-flooring-background_53876-128025.jpg')] bg-cover opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="flex items-center relative z-10">
              <Circle className="mr-2 text-piece-light" />
              <span>Single Player</span>
            </div>
          </Button>
          
          <Button 
            onClick={() => startNewGame('two-player')}
            className="py-8 text-lg bg-gradient-to-b from-amber-800 to-amber-700 hover:from-amber-800/90 hover:to-amber-700/80 shadow-md border border-amber-100/20 transform transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden group"
            variant="default"
          >
            <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-photo/brown-wooden-textured-flooring-background_53876-128025.jpg')] bg-cover opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="flex items-center relative z-10">
              <div className="flex mr-2">
                <Circle className="text-piece-light" />
                <Circle className="text-piece-light -ml-1" />
              </div>
              <span>Two Players</span>
            </div>
          </Button>
        </div>
      </div>
      
      <div className="mt-8 opacity-80">
        <p className="text-sm text-amber-900 italic font-medium">Click a mode to begin your journey</p>
      </div>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="absolute bottom-4 right-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer text-amber-900 font-medium text-sm">
            Made by Ben Asmah
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="bg-amber-50/90 backdrop-blur-sm border-amber-200">
          <p className="text-amber-900">International Checkers Game</p>
          <p className="text-xs text-amber-700">© 2023 All Rights Reserved</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default GameSetup;
