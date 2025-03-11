
import { useState, useEffect } from 'react';
import { createInitialBoard, isValidMove, executeMove, findCaptureSequences, findAllPossibleMoves } from '@/lib/gameUtils';
import { makeAIMove, DifficultyLevel } from '@/lib/aiService';
import { toast } from "sonner";

type GameMode = 'single' | 'two-player';

type GameState = {
  board: number[][];
  currentPlayer: 1 | -1;
};

export const useGameLogic = () => {
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<1 | -1>(1);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('beginner');
  const [gameStarted, setGameStarted] = useState(false);
  const [activeSequence, setActiveSequence] = useState<[number, number][] | null>(null);
  const [captureInProgress, setCaptureInProgress] = useState(false);
  const [moveHistory, setMoveHistory] = useState<GameState[]>([]);
  const [lightScore, setLightScore] = useState(0);
  const [darkScore, setDarkScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // AI move effect
  useEffect(() => {
    if (gameMode === 'single' && currentPlayer === -1 && gameStarted && !gameOver) {
      const timeoutId = setTimeout(() => {
        saveMoveToHistory();
        
        const aiMove = makeAIMove(board, difficultyLevel);
        if (aiMove) {
          const [startRow, startCol, endRow, endCol] = aiMove;
          let newBoard = executeMove(board, startRow, startCol, endRow, endCol);
          setBoard(newBoard);
          
          const isCapture = Math.abs(startRow - endRow) > 1;
          
          if (isCapture) {
            const captureSequences = findCaptureSequences(newBoard, endRow, endCol);
            
            if (captureSequences.length > 0 && captureSequences.some(seq => seq.length > 1)) {
              let bestSequence = captureSequences[0];
              for (const sequence of captureSequences) {
                if (sequence.length > bestSequence.length) {
                  bestSequence = sequence;
                }
              }
              
              if (bestSequence.length > 1) {
                let currentBoard = newBoard;
                let currentRow = endRow;
                let currentCol = endCol;
                
                for (let i = 1; i < bestSequence.length; i++) {
                  const [nextRow, nextCol] = bestSequence[i];
                  
                  ((i, currentRow, currentCol, nextRow, nextCol) => {
                    setTimeout(() => {
                      const updatedBoard = executeMove(
                        i === 1 ? newBoard : JSON.parse(JSON.stringify(board)), 
                        currentRow, 
                        currentCol, 
                        nextRow, 
                        nextCol
                      );
                      setBoard(updatedBoard);
                    }, 300 * i);
                  })(i, currentRow, currentCol, nextRow, nextCol);
                  
                  currentRow = nextRow;
                  currentCol = nextCol;
                }
                
                setTimeout(() => {
                  checkForKingPromotion(board);
                  setCurrentPlayer(1);
                  checkGameOver(board, 1);
                }, 300 * bestSequence.length);
                
                return;
              }
            }
          }
          
          checkForKingPromotion(newBoard);
          setCurrentPlayer(1);
          checkGameOver(newBoard, 1);
        } else {
          handleWin(1);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPlayer, board, gameMode, gameStarted, gameOver, difficultyLevel]);

  const checkGameOver = (currentBoard: number[][], nextPlayer: 1 | -1) => {
    let lightPieces = 0;
    let darkPieces = 0;
    
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = currentBoard[row][col];
        if (piece > 0) lightPieces++;
        if (piece < 0) darkPieces++;
      }
    }
    
    if (lightPieces <= 1) {
      handleWin(-1);
      return;
    }
    if (darkPieces <= 1) {
      handleWin(1);
      return;
    }
    
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
        const allSequences = findCaptureSequences(board, row, col);
        setSelectedPiece([row, col]);
        
        if (allSequences.length > 0) {
          setCaptureInProgress(Math.abs(piece) === 2 && allSequences.some(seq => seq.length > 2));
        }
      }
    } else {
      const [startRow, startCol] = selectedPiece;
      
      const allSequences = findCaptureSequences(board, startRow, startCol);
      
      const isValidNextMove = allSequences.some(sequence => 
        sequence.length > 1 && sequence[1][0] === row && sequence[1][1] === col
      );
      
      if (isValidNextMove) {
        saveMoveToHistory();
        
        const newBoard = executeMove(board, startRow, startCol, row, col);
        setBoard(newBoard);
        checkForKingPromotion(newBoard);
        
        const matchingSequence = allSequences.find(sequence => 
          sequence.length > 1 && sequence[1][0] === row && sequence[1][1] === col
        );
        
        if (matchingSequence && matchingSequence.length > 2) {
          setActiveSequence(matchingSequence.slice(1));
          setSelectedPiece([row, col]);
          
          const furtherCaptures = findCaptureSequences(newBoard, row, col);
          if (furtherCaptures.length > 0 && furtherCaptures.some(seq => seq.length > 1)) {
            setCaptureInProgress(true);
          } else {
            finishMove();
          }
        } else {
          finishMove();
        }
      } else if (captureInProgress) {
        toast.error("You must complete a capture sequence!");
      } else if (isValidMove(board, startRow, startCol, row, col)) {
        saveMoveToHistory();
        
        const newBoard = executeMove(board, startRow, startCol, row, col);
        setBoard(newBoard);
        checkForKingPromotion(newBoard);
        finishMove();
      } else {
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

  return {
    board,
    selectedPiece,
    currentPlayer,
    gameMode,
    difficultyLevel,
    setDifficultyLevel,
    gameStarted,
    activeSequence,
    moveHistory,
    lightScore,
    darkScore,
    gameOver,
    handleSquareClick,
    startNewGame,
    resetGame,
    undoMove,
    resetScores
  };
};
