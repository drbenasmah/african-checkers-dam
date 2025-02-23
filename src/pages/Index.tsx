
import React, { useState } from 'react';
import Board from '@/components/Board';
import { createInitialBoard, isValidMove } from '@/lib/gameUtils';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | -1>(1);

  const handleSquareClick = (row: number, col: number) => {
    if (selectedPiece === null) {
      const piece = board[row][col];
      if (piece !== 0 && Math.sign(piece) === currentPlayer) {
        setSelectedPiece([row, col]);
      }
    } else {
      const [startRow, startCol] = selectedPiece;
      
      if (isValidMove(board, startRow, startCol, row, col)) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = board[startRow][startCol];
        newBoard[startRow][startCol] = 0;
        
        setBoard(newBoard);
        setCurrentPlayer(prev => prev === 1 ? -1 : 1);
      }
      
      setSelectedPiece(null);
    }
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setCurrentPlayer(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-board-dark mb-2">International Checkers</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Current Player: {currentPlayer === 1 ? 'Light' : 'Dark'}
        </p>
        <Button onClick={resetGame} variant="outline" className="mb-8">
          Reset Game
        </Button>
      </div>
      
      <Board
        board={board}
        selectedPiece={selectedPiece}
        onSquareClick={handleSquareClick}
      />
    </div>
  );
};

export default Index;
