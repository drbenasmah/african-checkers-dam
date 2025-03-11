
import { findAllPossibleMoves, executeMove } from './gameUtils';
import { findBestCaptureSequence, executeFullCaptureSequence } from './aiCaptureUtils';
import { minimax } from './aiMinimax';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

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
  
  // Intermediate, Advanced, and Expert: Use minimax with different depths
  const depth = 
    difficultyLevel === 'intermediate' ? 3 : 
    difficultyLevel === 'advanced' ? 5 : 7; // Expert uses depth 7
  
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
