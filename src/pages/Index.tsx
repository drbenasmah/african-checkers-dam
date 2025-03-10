import React, { useState, useEffect } from 'react';
import Board from '@/components/Board';
import { createInitialBoard, isValidMove, makeAIMove, executeMove, findCaptureSequences, findAllPossibleMoves } from '@/lib/gameUtils';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Undo2, Trophy } from "lucide-react";

type GameMode = 'single' | 'two-player';

type GameState = {
  board: number[][];
  currentPlayer: 1 | -1;
};

const Index = () => {
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | -1>(1);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeSequence, setActiveSequence] = useState<[number, number][] | null>(null);
  const [captureInProgress, setCaptureInProgress] = useState(false);
  const [moveHistory, setMoveHistory] = useState<GameState[]>([]);
  const [lightScore, setLightScore] = useState(0);
  const [darkScore, setDarkScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameMode === 'single' && currentPlayer === -1 && gameStarted && !gameOver) {
      const timeoutId = setTimeout(() => {
        // Save current state before AI move
        saveMoveToHistory();
        
        const aiMove = makeAIMove(board);
        if (aiMove) {
          const [startRow, startCol, endRow, endCol] = aiMove;
          const newBoard = executeMove(board, startRow, startCol, endRow, endCol);
          setBoard(newBoard);
          checkForKingPromotion(newBoard);
          setCurrentPlayer(1);
          checkGameOver(newBoard, 1);
        } else {
          // If AI can't make a move, player wins
          handleWin(1);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, board, gameMode, gameStarted, gameOver]);

  const checkGameOver = (currentBoard: number[][], nextPlayer: 1 | -1) => {
    const possibleMoves = findAllPossibleMoves(currentBoard, nextPlayer);
    if (possibleMoves.length === 0) {
      handleWin(nextPlayer === 1 ? -1 : 1);
    }
  };

  const handleWin = (winner: 1 | -1) => {
    setGameOver(true);
    if (winner === 1) {
      setLightScore(prev => prev + 1);
      toast.success("Light player wins!");
    } else {
      setDarkScore(prev => prev + 1);
      toast.success("Dark player wins!");
    }
  };

  const saveMoveToHistory = () => {
    setMoveHistory(prev => [...prev, { board: JSON.parse(JSON.stringify(board)), currentPlayer }]);
  };

  const undoMove = () => {
    if (moveHistory.length === 0) return;
    
    const previousState = moveHistory[moveHistory.length - 1];
    setBoard(previousState.board);
    setCurrentPlayer(previousState.currentPlayer);
    setSelectedPiece(null);
    setActiveSequence(null);
    setCaptureInProgress(false);
    
    // Remove the last move from history
    setMoveHistory(prev => prev.slice(0, -1));
  };

  const checkForKingPromotion = (board: number[][]) => {
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
    if (!gameStarted || gameOver || (gameMode === 'single' && currentPlayer === -1)) return;

    if (selectedPiece === null) {
      const piece = board[row][col];
      if (piece !== 0 && Math.sign(piece) === currentPlayer) {
        // Find all possible capture sequences for the selected piece
        const allSequences = findCaptureSequences(board, row, col);
        setSelectedPiece([row, col]);
        
        // If there are capture sequences, prepare for capture
        if (allSequences.length > 0) {
          setCaptureInProgress(Math.abs(piece) === 2 && allSequences.some(seq => seq.length > 2));
          // Don't pre-set an active sequence - let the player choose their path
        }
      }
    } else {
      const [startRow, startCol] = selectedPiece;
      
      // Find all possible capture sequences for the selected piece
      const allSequences = findCaptureSequences(board, startRow, startCol);
      
      // Check if the clicked position is a valid next move in any sequence
      const isValidNextMove = allSequences.some(sequence => 
        sequence.length > 1 && sequence[1][0] === row && sequence[1][1] === col
      );
      
      if (isValidNextMove) {
        // Save current state before making a move
        saveMoveToHistory();
        
        // Execute the move
        const newBoard = executeMove(board, startRow, startCol, row, col);
        setBoard(newBoard);
        checkForKingPromotion(newBoard);
        
        // Find the sequence that matches the move for continuing the capture
        const matchingSequence = allSequences.find(sequence => 
          sequence.length > 1 && sequence[1][0] === row && sequence[1][1] === col
        );
        
        // Check if there are more captures in this sequence
        if (matchingSequence && matchingSequence.length > 2) {
          // Update activeSequence to the remaining part of the sequence
          setActiveSequence(matchingSequence.slice(1));
          setSelectedPiece([row, col]);
          
          // Check if further captures are possible from new position
          const furtherCaptures = findCaptureSequences(newBoard, row, col);
          if (furtherCaptures.length > 0 && furtherCaptures.some(seq => seq.length > 1)) {
            setCaptureInProgress(true);
          } else {
            // No more captures possible
            finishMove();
          }
        } else {
          // No more captures in this sequence
          finishMove();
        }
      } else if (captureInProgress) {
        toast.error("You must complete a capture sequence!");
      } else if (isValidMove(board, startRow, startCol, row, col)) {
        // Save current state before making a move
        saveMoveToHistory();
        
        // Regular non-capture move
        const newBoard = executeMove(board, startRow, startCol, row, col);
        setBoard(newBoard);
        checkForKingPromotion(newBoard);
        finishMove();
      } else {
        // Invalid move, reset selection
        setSelectedPiece(null);
        setActiveSequence(null);
      }
    }
  };
  
  const finishMove = () => {
    setSelectedPiece(null);
    setActiveSequence(null);
    setCaptureInProgress(false);
    const nextPlayer = currentPlayer === 1 ? -1 : 1;
    setCurrentPlayer(nextPlayer);
    checkGameOver(board, nextPlayer);
  };

  const startNewGame = (mode: GameMode) => {
    setGameMode(mode);
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setActiveSequence(null);
    setCurrentPlayer(1);
    setGameStarted(true);
    setMoveHistory([]);
    setGameOver(false);
  };

  const resetGame = () => {
    setGameMode(null);
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setActiveSequence(null);
    setCurrentPlayer(1);
    setGameStarted(false);
    setMoveHistory([]);
    setGameOver(false);
  };

  const resetScores = () => {
    setLightScore(0);
    setDarkScore(0);
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
        
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="flex flex-col items-center bg-board-light p-3 rounded-lg shadow-md">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-piece-light border border-gray-300"></span>
              <span className="font-semibold">Light</span>
            </div>
            <div className="flex items-center mt-1">
              <Trophy className="text-yellow-500 w-5 h-5 mr-1" />
              <span className="text-xl font-bold">{lightScore}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center bg-board-dark p-3 rounded-lg shadow-md text-white">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-piece-dark border border-gray-300"></span>
              <span className="font-semibold">Dark</span>
            </div>
            <div className="flex items-center mt-1">
              <Trophy className="text-yellow-500 w-5 h-5 mr-1" />
              <span className="text-xl font-bold">{darkScore}</span>
            </div>
          </div>
        </div>
        
        <p className="text-lg text-muted-foreground mb-4">
          {gameOver ? 
            "Game Over! Start a new game." : 
            gameMode === 'single' && currentPlayer === -1 ? 
              "AI's turn..." : 
              `Current Player: ${currentPlayer === 1 ? 'Light' : 'Dark'}`
          }
        </p>
        
        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          <Button onClick={resetGame} variant="outline">
            New Game
          </Button>
          <Button onClick={() => startNewGame(gameMode)} variant="outline">
            Restart
          </Button>
          <Button 
            onClick={undoMove} 
            variant="outline" 
            disabled={moveHistory.length === 0 || gameOver || (gameMode === 'single' && currentPlayer === -1)}
          >
            <Undo2 className="mr-2" /> Undo
          </Button>
          <Button onClick={resetScores} variant="outline">
            Reset Scores
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
