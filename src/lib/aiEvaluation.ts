
// Board evaluation utilities for AI

// Evaluate the board position for the AI player (-1)
// Higher score is better for the AI
export const evaluateBoard = (board: number[][]): number => {
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
