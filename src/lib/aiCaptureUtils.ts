
import { findCaptureSequences, executeMove } from './gameUtils';

// Find the best capture sequence for a move
export const findBestCaptureSequence = (
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
export const executeFullCaptureSequence = (
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
