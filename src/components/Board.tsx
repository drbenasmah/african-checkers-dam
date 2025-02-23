
import React from 'react';
import Square from './Square';
import { calculateSquareColor } from '@/lib/gameUtils';

interface BoardProps {
  selectedPiece: number[] | null;
  onSquareClick: (row: number, col: number) => void;
  board: Array<Array<number>>;
}

const Board: React.FC<BoardProps> = ({ selectedPiece, onSquareClick, board }) => {
  return (
    <div className="grid grid-cols-10 w-full max-w-[600px] aspect-square border-4 border-board-dark rounded-lg overflow-hidden shadow-2xl">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            color={calculateSquareColor(rowIndex, colIndex)}
            piece={piece}
            isSelected={selectedPiece?.[0] === rowIndex && selectedPiece?.[1] === colIndex}
            onClick={() => onSquareClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
