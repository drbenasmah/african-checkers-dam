
import { findAllPossibleMoves, executeMove } from './gameUtils';
import { evaluateBoard } from './aiEvaluation';
import { findBestCaptureSequence, executeFullCaptureSequence } from './aiCaptureUtils';

// Minimax algorithm with alpha-beta pruning
export const minimax = (
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
