
import React from 'react';
import { Crown } from 'lucide-react';

interface PieceProps {
  type: number;
  isSelected: boolean;
}

const Piece: React.FC<PieceProps> = ({ type, isSelected }) => {
  const isKing = Math.abs(type) === 2;
  const isLight = type > 0;

  return (
    <div
      className={`absolute inset-2 rounded-full transition-all duration-300
        ${isLight ? 'bg-piece-light' : 'bg-piece-dark'}
        ${isSelected ? 'animate-piece-selected ring-4 ring-board-selected' : ''}
        ${isKing ? 'ring-2 ring-yellow-400' : ''}
        hover:scale-105 cursor-pointer shadow-lg flex items-center justify-center`}
    >
      {isKing && (
        <Crown 
          className={`w-1/2 h-1/2 ${isLight ? 'text-piece-dark' : 'text-piece-light'} drop-shadow-md`}
          strokeWidth={2.5}
        />
      )}
    </div>
  );
};

export default Piece;
