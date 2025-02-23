
import React from 'react';
import Piece from './Piece';

interface SquareProps {
  color: string;
  piece: number;
  isSelected: boolean;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ color, piece, isSelected, onClick }) => {
  return (
    <div
      className={`aspect-square ${color} transition-colors duration-300 relative`}
      onClick={onClick}
    >
      {piece !== 0 && <Piece type={piece} isSelected={isSelected} />}
    </div>
  );
};

export default Square;
