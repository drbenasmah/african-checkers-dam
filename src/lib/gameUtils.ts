
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
  
  return false;
};

export const findAllPossibleMoves = (board: number[][], player: number): Array<[number, number, number, number]> => {
  const moves: Array<[number, number, number, number]> = [];
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (Math.sign(board[row][col]) === player) {
        // Check all possible diagonal moves
        const directions = [
          [-1, -1], [-1, 1], // Forward moves
          [1, -1], [1, 1]    // Backward moves (for kings)
        ];
        
        directions.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          
          if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
            if (isValidMove(board, row, col, newRow, newCol)) {
              moves.push([row, col, newRow, newCol]);
            }
          }
        });
      }
    }
  }
  
  return moves;
};

export const makeAIMove = (board: number[][]): [number, number, number, number] | null => {
  const possibleMoves = findAllPossibleMoves(board, -1); // AI plays as dark pieces (-1)
  
  if (possibleMoves.length === 0) return null;
  
  // For now, just choose a random move from all possible moves
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
};

