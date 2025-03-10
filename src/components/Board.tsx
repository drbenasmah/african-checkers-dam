
import React from 'react';
import Square from './Square';
import { calculateSquareColor, findCaptureSequences } from '@/lib/gameUtils';

interface BoardProps {
  selectedPiece: number[] | null;
  onSquareClick: (row: number, col: number) => void;
  board: Array<Array<number>>;
  activeSequence?: [number, number][];
}

const Board: React.FC<BoardProps> = ({ selectedPiece, onSquareClick, board, activeSequence }) => {
  const availableMoves = selectedPiece 
    ? findCaptureSequences(board, selectedPiece[0], selectedPiece[1])
    : [];

  const isAvailableMove = (row: number, col: number): boolean => {
    if (!selectedPiece) return false;
    
    // If a capture is in progress and we have an active sequence
    if (activeSequence && activeSequence.length > 1) {
      const nextMove = activeSequence[1];
      return nextMove[0] === row && nextMove[1] === col;
    }

    // Show all possible next moves from all sequences
    return availableMoves.some(sequence => 
      sequence.length > 1 && sequence[1][0] === row && sequence[1][1] === col
    );
  };

  return (
    <div className="grid grid-cols-10 w-full max-w-[600px] aspect-square border-4 border-board-dark rounded-lg overflow-hidden shadow-2xl">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            color={calculateSquareColor(rowIndex, colIndex)}
            piece={piece}
            isSelected={selectedPiece?.[0] === rowIndex && selectedPiece?.[1] === colIndex}
            isAvailableMove={isAvailableMove(rowIndex, colIndex)}
            onClick={() => onSquareClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
