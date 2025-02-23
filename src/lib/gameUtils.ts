
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

// Check if a capture is possible from a specific position
export const canCapture = (
  board: number[][],
  row: number,
  col: number,
  isKing: boolean
): boolean => {
  const piece = board[row][col];
  if (piece === 0) return false;

  const directions = [
    [-2, -2], [-2, 2], // Forward captures
    [2, -2], [2, 2]    // Backward captures
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    const midRow = row + dRow/2;
    const midCol = col + dCol/2;

    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
      const targetPiece = board[midRow][midCol];
      if (targetPiece !== 0 && Math.sign(targetPiece) !== Math.sign(piece) && board[newRow][newCol] === 0) {
        return true;
      }
    }
  }

  return false;
};

// Find all possible capture sequences from a position
export const findCaptureSequences = (
  board: number[][],
  row: number,
  col: number,
  sequence: [number, number][] = [[row, col]],
  allSequences: [number, number][][] = []
): [number, number][][] => {
  const piece = board[row][col];
  const isKing = Math.abs(piece) === 2;
  
  const directions = [
    [-2, -2], [-2, 2], // Forward captures
    [2, -2], [2, 2]    // Backward captures
  ];

  let foundCapture = false;
  
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    const midRow = row + dRow/2;
    const midCol = col + dCol/2;

    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
      const targetPiece = board[midRow][midCol];
      if (targetPiece !== 0 && 
          Math.sign(targetPiece) !== Math.sign(piece) && 
          board[newRow][newCol] === 0) {
        
        // Create a new board state for recursive checking
        const newBoard = board.map(row => [...row]);
        newBoard[midRow][midCol] = 0; // Remove captured piece
        newBoard[row][col] = 0;       // Remove moving piece from original position
        newBoard[newRow][newCol] = piece; // Place piece in new position
        
        foundCapture = true;
        
        // Recursively find more captures
        findCaptureSequences(
          newBoard,
          newRow,
          newCol,
          [...sequence, [newRow, newCol]],
          allSequences
        );
      }
    }
  }
  
  if (!foundCapture && sequence.length > 1) {
    allSequences.push(sequence);
  }
  
  return allSequences;
};

// Check if any piece can make a capture
export const hasAvailableCaptures = (board: number[][], currentPlayer: number): boolean => {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      if (Math.sign(piece) === currentPlayer) {
        const isKing = Math.abs(piece) === 2;
        if (canCapture(board, row, col, isKing)) {
          return true;
        }
      }
    }
  }
  return false;
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
  
  // Check if any captures are available
  if (hasAvailableCaptures(board, Math.sign(piece))) {
    // If captures are available, only allow capture moves
    const captureSequences = findCaptureSequences(board, startRow, startCol);
    return captureSequences.some(sequence => 
      sequence.length > 1 && 
      sequence[1][0] === endRow && 
      sequence[1][1] === endCol
    );
  }
  
  // If no captures are available, allow normal moves
  const direction = piece > 0 ? 1 : -1;
  if (Math.abs(startRow - endRow) === 1 && Math.abs(startCol - endCol) === 1) {
    if (!isKing && (endRow - startRow) * direction < 0) return false;
    return board[endRow][endCol] === 0;
  }
  
  return false;
};

export const executeMove = (
  board: number[][],
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): number[][] => {
  const newBoard = board.map(row => [...row]);
  const piece = board[startRow][startCol];
  
  // If it's a capture move
  if (Math.abs(startRow - endRow) === 2) {
    const midRow = (startRow + endRow) / 2;
    const midCol = (startCol + endCol) / 2;
    newBoard[midRow][midCol] = 0; // Remove captured piece
  }
  
  // Move the piece
  newBoard[endRow][endCol] = piece;
  newBoard[startRow][startCol] = 0;
  
  return newBoard;
};

export const findAllPossibleMoves = (board: number[][], player: number): Array<[number, number, number, number]> => {
  const moves: Array<[number, number, number, number]> = [];
  
  // First check for captures
  if (hasAvailableCaptures(board, player)) {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (Math.sign(board[row][col]) === player) {
          const captureSequences = findCaptureSequences(board, row, col);
          captureSequences.forEach(sequence => {
            if (sequence.length > 1) {
              moves.push([row, col, sequence[1][0], sequence[1][1]]);
            }
          });
        }
      }
    }
    return moves;
  }
  
  // If no captures, look for regular moves
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if (Math.sign(board[row][col]) === player) {
        const isKing = Math.abs(board[row][col]) === 2;
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
  const possibleMoves = findAllPossibleMoves(board, -1);
  
  if (possibleMoves.length === 0) return null;
  
  // Prioritize capture moves
  const captureMoves = possibleMoves.filter(([startRow, startCol, endRow, endCol]) => 
    Math.abs(startRow - endRow) === 2
  );
  
  if (captureMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * captureMoves.length);
    return captureMoves[randomIndex];
  }
  
  // If no captures available, make a random move
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
};
