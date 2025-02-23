
import React from 'react';
import Piece from './Piece';

interface SquareProps {
  color: string;
  piece: number;
  isSelected: boolean;
  isAvailableMove: boolean;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ color, piece, isSelected, isAvailableMove, onClick }) => {
  return (
    <div
      className={`
        aspect-square ${color} transition-colors duration-300 relative
        ${isAvailableMove ? 'ring-4 ring-board-selected ring-inset' : ''}
      `}
      onClick={onClick}
    >
      {piece !== 0 && <Piece type={piece} isSelected={isSelected} />}
      {isAvailableMove && !piece && (
        <div className="absolute inset-4 rounded-full bg-board-selected opacity-40" />
      )}
    </div>
  );
};

export default Square;
