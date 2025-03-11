
import React from 'react';
import { Trophy, Brain } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DifficultyLevel } from '@/lib/aiService';

interface GameHeaderProps {
  lightScore: number;
  darkScore: number;
  gameOver: boolean;
  gameMode: 'single' | 'two-player' | null;
  currentPlayer: 1 | -1;
  difficultyLevel: DifficultyLevel;
  resetGame: () => void;
  startNewGame: (mode: 'single' | 'two-player') => void;
  undoMove: () => void;
  resetScores: () => void;
  moveHistory: any[];
}

const GameHeader: React.FC<GameHeaderProps> = ({
  lightScore,
  darkScore,
  gameOver,
  gameMode,
  currentPlayer,
  difficultyLevel,
  resetGame,
  startNewGame,
  undoMove,
  resetScores,
  moveHistory
}) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-board-dark mb-2">International Checkers</h1>
      
      <div className="flex justify-center items-center gap-8 mb-4">
        <div className="flex flex-col items-center bg-board-light p-3 rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-piece-light border border-gray-300"></span>
            <span className="font-semibold">Light</span>
          </div>
          <div className="flex items-center mt-1">
            <Trophy className="text-yellow-500 w-5 h-5 mr-1" />
            <span className="text-xl font-bold">{lightScore}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center bg-board-dark p-3 rounded-lg shadow-md text-white">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-piece-dark border border-gray-300"></span>
            <span className="font-semibold">Dark</span>
          </div>
          <div className="flex items-center mt-1">
            <Trophy className="text-yellow-500 w-5 h-5 mr-1" />
            <span className="text-xl font-bold">{darkScore}</span>
          </div>
        </div>
      </div>
      
      <p className="text-lg text-muted-foreground mb-4">
        {gameOver ? 
          "Game Over! Start a new game." : 
          gameMode === 'single' && currentPlayer === -1 ? 
            `AI's turn... (${difficultyLevel} level)` : 
            `Current Player: ${currentPlayer === 1 ? 'Light' : 'Dark'}`
        }
      </p>
      
      <div className="flex gap-4 justify-center mb-8 flex-wrap">
        <Button onClick={resetGame} variant="outline">
          New Game
        </Button>
        <Button onClick={() => startNewGame(gameMode!)} variant="outline">
          Restart
        </Button>
        <Button 
          onClick={undoMove} 
          variant="outline" 
          disabled={moveHistory.length === 0 || gameOver || (gameMode === 'single' && currentPlayer === -1)}
        >
          <Undo2 className="mr-2" /> Undo
        </Button>
        <Button onClick={resetScores} variant="outline">
          Reset Scores
        </Button>
      </div>
    </div>
  );
};

export default GameHeader;

import { Undo2 } from 'lucide-react';
