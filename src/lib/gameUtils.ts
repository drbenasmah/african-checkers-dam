
export const calculateSquareColor = (row: number, col: number): string => {
  return (row + col) % 2 === 0 ? 'bg-board-light' : 'bg-board-dark';
};

export const createInitialBoard = (): number[][] => {
  const board = Array(10).fill(null).map(() => Array(10).fill(0));
  
  // Place light pieces (1)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 1;
      }
    }
  }
  
  // Place dark pieces (-1)
  for (let row = 6; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = -1;
      }
    }
  }
  
  return board;
};

export const isValidMove = (
  board: number[][],
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): boolean => {
  const piece = board[startRow][startCol];
  if (piece === 0) return false;
  
  const isKing = Math.abs(piece) === 2;
  const direction = piece > 0 ? 1 : -1;
  
  // Basic move (one square diagonally)
  if (Math.abs(startRow - endRow) === 1 && Math.abs(startCol - endCol) === 1) {
    if (!isKing && (endRow - startRow) * direction < 0) return false;
    return board[endRow][endCol] === 0;
  }
  
  return false; // For now, only implement basic moves
};
