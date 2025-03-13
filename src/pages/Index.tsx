
import React from 'react';
import Board from '@/components/Board';
import GameSetup from '@/components/GameSetup';
import GameHeader from '@/components/GameHeader';
import Footer from '@/components/Footer';
import { useGameLogic } from '@/hooks/useGameLogic';

const Index = () => {
  const {
    board,
    selectedPiece,
    currentPlayer,
    gameMode,
    difficultyLevel,
    setDifficultyLevel,
    gameStarted,
    activeSequence,
    moveHistory,
    lightScore,
    darkScore,
    gameOver,
    handleSquareClick,
    startNewGame,
    resetGame,
    undoMove,
    resetScores
  } = useGameLogic();

  if (!gameStarted) {
    return (
      <>
        <GameSetup 
          difficultyLevel={difficultyLevel}
          setDifficultyLevel={setDifficultyLevel}
          startNewGame={startNewGame}
        />
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md mb-4">
        <GameHeader
          lightScore={lightScore}
          darkScore={darkScore}
          gameOver={gameOver}
          gameMode={gameMode}
          currentPlayer={currentPlayer}
          difficultyLevel={difficultyLevel}
          resetGame={resetGame}
          startNewGame={startNewGame}
          undoMove={undoMove}
          resetScores={resetScores}
          moveHistory={moveHistory}
        />
        
        <Board
          board={board}
          selectedPiece={selectedPiece}
          onSquareClick={handleSquareClick}
          activeSequence={activeSequence || undefined}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
