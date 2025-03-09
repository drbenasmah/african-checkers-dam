
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

const shouldPromoteToKing = (board: number[][], row: number, col: number, piece: number): boolean => {
  if (Math.abs(piece) === 2) return false; // Already a king
  
  // Light pieces promote at row 9, dark pieces at row 0
  return (piece === 1 && row === 9) || (piece === -1 && row === 0);
};

const promoteToKing = (piece: number): number => {
  return piece > 0 ? 2 : -2;
};

const isDiagonalPathClear = (
  board: number[][],
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): boolean => {
  // Make sure we're checking a diagonal
  if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) {
    return false;
  }
  
  const rowStep = Math.sign(endRow - startRow);
  const colStep = Math.sign(endCol - startCol);
  let currentRow = startRow + rowStep;
  let currentCol = startCol + colStep;

  while (currentRow !== endRow || currentCol !== endCol) {
    // Check if still on board
    if (currentRow < 0 || currentRow >= 10 || currentCol < 0 || currentCol >= 10) {
      return false;
    }
    // Check if path is clear
    if (board[currentRow][currentCol] !== 0) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  return true;
};

export const canCapture = (
  board: number[][],
  row: number,
  col: number,
  isKing: boolean
): boolean => {
  const piece = board[row][col];
  if (piece === 0) return false;

  // For kings, check all diagonal directions for captures at any distance
  if (isKing) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    for (const [dRow, dCol] of directions) {
      let currentRow = row + dRow;
      let currentCol = col + dCol;
      let foundEnemy = false;
      
      while (currentRow >= 0 && currentRow < 10 && currentCol >= 0 && currentCol < 10) {
        const currentPiece = board[currentRow][currentCol];
        
        if (currentPiece !== 0) {
          if (!foundEnemy && Math.sign(currentPiece) !== Math.sign(piece)) {
            foundEnemy = true;
          } else if (foundEnemy) {
            break; // Either found second piece or found friendly piece
          } else {
            break; // Found friendly piece first
          }
        } else if (foundEnemy) {
          // Found empty space after enemy piece
          return true;
        }
        
        currentRow += dRow;
        currentCol += dCol;
      }
    }
    return false;
  }

  // For regular pieces, check immediate diagonal captures
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

export const findCaptureSequences = (
  board: number[][],
  row: number,
  col: number,
  sequence: [number, number][] = [[row, col]],
  allSequences: [number, number][][] = []
): [number, number][][] => {
  const piece = board[row][col];
  const isKing = Math.abs(piece) === 2;
  let foundCapture = false;
  
  if (isKing) {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    for (const [dRow, dCol] of directions) {
      let currentRow = row + dRow;
      let currentCol = col + dCol;
      let foundEnemy = false;
      let enemyRow = -1;
      let enemyCol = -1;
      
      while (currentRow >= 0 && currentRow < 10 && currentCol >= 0 && currentCol < 10) {
        const currentPiece = board[currentRow][currentCol];
        
        if (currentPiece !== 0) {
          if (!foundEnemy && Math.sign(currentPiece) !== Math.sign(piece)) {
            foundEnemy = true;
            enemyRow = currentRow;
            enemyCol = currentCol;
          } else {
            break; // Either found second piece or found friendly piece
          }
        } else if (foundEnemy) {
          // Create a new board state for recursive checking
          const newBoard = board.map(row => [...row]);
          newBoard[enemyRow][enemyCol] = 0; // Remove captured piece
          newBoard[row][col] = 0;           // Remove moving piece
          newBoard[currentRow][currentCol] = piece; // Place piece in new position
          
          foundCapture = true;
          // Add this landing position to the sequence
          const newSequence = [...sequence, [currentRow, currentCol]];
          
          // Check for further captures from this position
          const furtherCaptures = findCaptureSequences(
            newBoard,
            currentRow,
            currentCol,
            newSequence,
            allSequences
          );
          
          // If no further captures possible from this position, add the sequence
          if (furtherCaptures.length === 0 && newSequence.length > 1) {
            allSequences.push(newSequence);
          }
        }
        
        currentRow += dRow;
        currentCol += dCol;
      }
    }
  } else {
    // Regular piece capture logic
    const directions = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
    
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
          
          const newBoard = board.map(row => [...row]);
          newBoard[midRow][midCol] = 0;
          newBoard[row][col] = 0;
          newBoard[newRow][newCol] = piece;
          
          foundCapture = true;
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
  }
  
  if (!foundCapture && sequence.length > 1) {
    allSequences.push(sequence);
  }
  
  return allSequences;
};

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
  
  // Check if target square is empty and on the board
  if (endRow < 0 || endRow >= 10 || endCol < 0 || endCol >= 10 || board[endRow][endCol] !== 0) {
    return false;
  }
  
  // Check if the move is diagonal
  const isDiagonal = Math.abs(startRow - endRow) === Math.abs(startCol - endCol);
  if (!isDiagonal) return false;

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
  
  if (isKing) {
    // Kings can move any distance diagonally in any direction if path is clear
    return isDiagonalPathClear(board, startRow, startCol, endRow, endCol);
  } else {
    // Regular pieces can only move one square diagonally forward
    const direction = piece > 0 ? 1 : -1;
    return Math.abs(startCol - endCol) === 1 && 
           (endRow - startRow) * direction > 0;
  }
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
  const isKing = Math.abs(piece) === 2;
  
  // If it's a capture move
  if (Math.abs(startRow - endRow) > 1) {
    if (isKing) {
      // For kings, find and remove the captured piece
      const rowStep = Math.sign(endRow - startRow);
      const colStep = Math.sign(endCol - startCol);
      let currentRow = startRow + rowStep;
      let currentCol = startCol + colStep;
      
      while (currentRow !== endRow || currentCol !== endCol) {
        if (newBoard[currentRow][currentCol] !== 0) {
          newBoard[currentRow][currentCol] = 0;
          break;
        }
        currentRow += rowStep;
        currentCol += colStep;
      }
    } else {
      // For regular pieces, remove the captured piece in the middle
      const midRow = (startRow + endRow) / 2;
      const midCol = (startCol + endCol) / 2;
      newBoard[midRow][midCol] = 0;
    }
  }
  
  // Move the piece
  newBoard[startRow][startCol] = 0;
  
  // Check for promotion
  if (shouldPromoteToKing(board, endRow, endCol, piece)) {
    newBoard[endRow][endCol] = promoteToKing(piece);
  } else {
    newBoard[endRow][endCol] = piece;
  }
  
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
      const piece = board[row][col];
      if (Math.sign(piece) === player) {
        const isKing = Math.abs(piece) === 2;
        
        if (isKing) {
          // Check all diagonal directions for kings (including backwards)
          const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
          
          for (const [dRow, dCol] of directions) {
            let distance = 1;
            
            // Try each distance in this direction
            while (true) {
              const newRow = row + dRow * distance;
              const newCol = col + dCol * distance;
              
              // Check if we're still on the board
              if (newRow < 0 || newRow >= 10 || newCol < 0 || newCol >= 10) {
                break;
              }
              
              // Check if the square is empty
              if (board[newRow][newCol] !== 0) {
                break;
              }
              
              // Only add moves that are valid according to isValidMove
              if (isDiagonalPathClear(board, row, col, newRow, newCol)) {
                moves.push([row, col, newRow, newCol]);
              }
              
              distance++;
            }
          }
        } else {
          // Regular piece moves - one square diagonally forward
          const direction = player > 0 ? 1 : -1;
          const possibleMoves = [
            [direction, -1],
            [direction, 1]
          ];
          
          for (const [dRow, dCol] of possibleMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
              if (isValidMove(board, row, col, newRow, newCol)) {
                moves.push([row, col, newRow, newCol]);
              }
            }
          }
        }
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
    Math.abs(startRow - endRow) > 1
  );
  
  if (captureMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * captureMoves.length);
    return captureMoves[randomIndex];
  }
  
  // If no captures available, make a random move
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex];
};
