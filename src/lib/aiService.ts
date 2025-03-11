
import { findAllPossibleMoves, executeMove, findCaptureSequences } from './gameUtils';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Evaluate the board position for the AI player (-1)
// Higher score is better for the AI
const evaluateBoard = (board: number[][]): number => {
  let score = 0;
  
  // Count pieces and their positions
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const piece = board[row][col];
      
      if (piece !== 0) {
        const pieceValue = Math.abs(piece) === 1 ? 1 : 3; // Kings are worth more
        const playerFactor = Math.sign(piece);
        
        // Base piece value
        score -= pieceValue * playerFactor; // Subtract for player 1, add for player -1
        
        // Position value - encourage AI pieces to advance
        if (piece < 0) { // AI pieces
          // Prefer advanced positions
          score += (9 - row) * 0.1;
          
          // Prefer central columns slightly
          const centerDistance = Math.abs(col - 4.5);
          score += (5 - centerDistance) * 0.05;
        }
      }
    }
  }
  
  return score;
};

// Find the best capture sequence for a move
const findBestCaptureSequence = (
  board: number[][],
  startRow: number,
  startCol: number
): [number, number][] | null => {
  const sequences = findCaptureSequences(board, startRow, startCol);
  
  if (sequences.length === 0) return null;
  
  // Find the longest capture sequence
  let bestSequence = sequences[0];
  
  for (const sequence of sequences) {
    if (sequence.length > bestSequence.length) {
      bestSequence = sequence;
    }
  }
  
  return bestSequence;
};

// Execute a full capture sequence and return the final board state
const executeFullCaptureSequence = (
  board: number[][],
  sequence: [number, number][]
): number[][] => {
  if (sequence.length <= 1) return board;
  
  let currentBoard = board;
  let startRow = sequence[0][0];
  let startCol = sequence[0][1];
  
  // Execute each step in the sequence
  for (let i = 1; i < sequence.length; i++) {
    const [endRow, endCol] = sequence[i];
    currentBoard = executeMove(currentBoard, startRow, startCol, endRow, endCol);
    startRow = endRow;
    startCol = endCol;
  }
  
  return currentBoard;
};

// Minimax algorithm with alpha-beta pruning
const minimax = (
  board: number[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  currentPlayer: 1 | -1
): number => {
  // Base case: if we've reached our depth limit or game over
  if (depth === 0) {
    return evaluateBoard(board);
  }
  
  const possibleMoves = findAllPossibleMoves(board, currentPlayer);
  
  // If no moves available, this position is very bad for current player
  if (possibleMoves.length === 0) {
    return isMaximizingPlayer ? -1000 : 1000;
  }
  
  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    
    for (const [startRow, startCol, endRow, endCol] of possibleMoves) {
      // First execute the initial move
      let newBoard = executeMove(board, startRow, startCol, endRow, endCol);
      
      // Check if this is a capture move (distance > 1)
      const isCapture = Math.abs(startRow - endRow) > 1;
      
      // If it's a capture, look for additional captures in the sequence
      if (isCapture) {
        const captureSequence = findBestCaptureSequence(newBoard, endRow, endCol);
        if (captureSequence && captureSequence.length > 1) {
          // Execute the full capture sequence
          newBoard = executeFullCaptureSequence(newBoard, captureSequence);
        }
      }
      
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, currentPlayer === 1 ? -1 : 1);
      maxEval = Math.max(maxEval, evaluation);
      
      // Alpha-beta pruning
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    
    return maxEval;
  } else {
    let minEval = Infinity;
    
    for (const [startRow, startCol, endRow, endCol] of possibleMoves) {
      // First execute the initial move
      let newBoard = executeMove(board, startRow, startCol, endRow, endCol);
      
      // Check if this is a capture move (distance > 1)
      const isCapture = Math.abs(startRow - endRow) > 1;
      
      // If it's a capture, look for additional captures in the sequence
      if (isCapture) {
        const captureSequence = findBestCaptureSequence(newBoard, endRow, endCol);
        if (captureSequence && captureSequence.length > 1) {
          // Execute the full capture sequence
          newBoard = executeFullCaptureSequence(newBoard, captureSequence);
        }
      }
      
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, currentPlayer === 1 ? -1 : 1);
      minEval = Math.min(minEval, evaluation);
      
      // Alpha-beta pruning
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    
    return minEval;
  }
};

export const makeAIMove = (
  board: number[][],
  difficultyLevel: DifficultyLevel
): [number, number, number, number] | null => {
  const possibleMoves = findAllPossibleMoves(board, -1);
  
  if (possibleMoves.length === 0) return null;
  
  // Beginner: Randomly choose any valid move
  if (difficultyLevel === 'beginner') {
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
  }
  
  // Intermediate and Advanced: Use minimax with different depths
  const depth = difficultyLevel === 'intermediate' ? 3 : 5;
  
  // Default to random move as fallback
  let bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  let bestScore = -Infinity;
  
  // Evaluate each move
  for (const move of possibleMoves) {
    const [startRow, startCol, endRow, endCol] = move;
    
    // First execute the initial move
    let newBoard = executeMove(board, startRow, startCol, endRow, endCol);
    
    // Check if this is a capture move (distance > 1)
    const isCapture = Math.abs(startRow - endRow) > 1;
    
    // If it's a capture, look for additional captures in the sequence
    if (isCapture) {
      const captureSequence = findBestCaptureSequence(newBoard, endRow, endCol);
      if (captureSequence && captureSequence.length > 1) {
        // For evaluation, execute the full capture sequence
        newBoard = executeFullCaptureSequence(newBoard, captureSequence);
      }
    }
    
    // Evaluate this move
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, 1);
    
    // Update best move if this one is better
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
};
