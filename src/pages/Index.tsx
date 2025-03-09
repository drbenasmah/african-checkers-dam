
import React, { useState, useEffect } from 'react';
import Board from '@/components/Board';
import { createInitialBoard, isValidMove, makeAIMove, executeMove, findCaptureSequences } from '@/lib/gameUtils';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

type GameMode = 'single' | 'two-player';

const Index = () => {
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | -1>(1);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeSequence, setActiveSequence] = useState<[number, number][] | null>(null);

  useEffect(() => {
    if (gameMode === 'single' && currentPlayer === -1 && gameStarted) {
      // Add a small delay to make AI moves feel more natural
      const timeoutId = setTimeout(() => {
        const aiMove = makeAIMove(board);
        if (aiMove) {
          const [startRow, startCol, endRow, endCol] = aiMove;
          const newBoard = executeMove(board, startRow, startCol, endRow, endCol);
          setBoard(newBoard);
          checkForKingPromotion(newBoard);
          setCurrentPlayer(1);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, board, gameMode, gameStarted]);

  const checkForKingPromotion = (board: number[][]) => {
    // Check if any promotion happened
    for (let col = 0; col < 10; col++) {
      if (board[9][col] === 1) {
        toast.success("Piece promoted to King!");
        break;
      }
      if (board[0][col] === -1) {
        toast.success("Piece promoted to King!");
        break;
      }
    }
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!gameStarted || (gameMode === 'single' && currentPlayer === -1)) return;

    if (selectedPiece === null) {
      const piece = board[row][col];
      if (piece !== 0 && Math.sign(piece) === currentPlayer) {
        // When selecting a piece, check for possible capture sequences
        const sequences = findCaptureSequences(board, row, col);
        if (sequences.length > 0) {
          setActiveSequence(sequences[0]);
          toast.info("Capture sequence available! You must complete the capture.");
        }
        setSelectedPiece([row, col]);
      }
    } else {
      const [startRow, startCol] = selectedPiece;
      
      if (isValidMove(board, startRow, startCol, row, col)) {
        const newBoard = executeMove(board, startRow, startCol, row, col);
        setBoard(newBoard);
        checkForKingPromotion(newBoard);

        // If there's an active sequence and this isn't the last move
        if (activeSequence && activeSequence.length > 2) {
          // Remove the completed move from the sequence
          const nextSequence = activeSequence.slice(1);
          const nextPos = nextSequence[1];
          
          // Update the selected piece to the new position
          setSelectedPiece([row, col]);
          setActiveSequence(nextSequence);
          toast.info("Continue the capture sequence!");
        } else {
          // End of sequence or regular move
          setSelectedPiece(null);
          setActiveSequence(null);
          setCurrentPlayer(prev => prev === 1 ? -1 : 1);
        }
      } else {
        // Invalid move
        setSelectedPiece(null);
        setActiveSequence(null);
      }
    }
  };

  const startNewGame = (mode: GameMode) => {
    setGameMode(mode);
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setActiveSequence(null);
    setCurrentPlayer(1);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameMode(null);
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setActiveSequence(null);
    setCurrentPlayer(1);
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4 gap-8">
        <h1 className="text-4xl font-bold text-board-dark mb-8">International Checkers</h1>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => startNewGame('single')}
            className="w-48 text-lg"
            variant="default"
          >
            Single Player
          </Button>
          <Button 
            onClick={() => startNewGame('two-player')}
            className="w-48 text-lg"
            variant="outline"
          >
            Two Players
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-board-dark mb-2">International Checkers</h1>
        <p className="text-lg text-muted-foreground mb-4">
          {gameMode === 'single' && currentPlayer === -1 
            ? "AI's turn..." 
            : `Current Player: ${currentPlayer === 1 ? 'Light' : 'Dark'}`
          }
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={resetGame} variant="outline">
            New Game
          </Button>
          <Button onClick={() => startNewGame(gameMode)} variant="outline">
            Restart
          </Button>
        </div>
      </div>
      
      <Board
        board={board}
        selectedPiece={selectedPiece}
        onSquareClick={handleSquareClick}
        activeSequence={activeSequence || undefined}
      />
    </div>
  );
};

export default Index;
