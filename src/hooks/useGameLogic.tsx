
import { useState, useEffect } from 'react';
import { createInitialBoard, isValidMove, executeMove, findCaptureSequences, findAllPossibleMoves } from '@/lib/gameUtils';
import { makeAIMove, DifficultyLevel } from '@/lib/aiService';
import { toast } from "sonner";
import { useOnlineMultiplayer, GameSession } from './useOnlineMultiplayer';
import { GameMode } from '@/pages/Index';

// Remove this duplicate type definition and use the imported one
// export type GameMode = 'single' | 'two-player' | 'online';

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
  const [onlineSessionId, setOnlineSessionId] = useState<string | null>(null);
  const [showOnlineSetup, setShowOnlineSetup] = useState(false);

  const {
    onlineState,
    gameSession,
    makeMove,
    leaveGame
  } = useOnlineMultiplayer();

  // Handle online game state updates
  useEffect(() => {
    if (gameMode === 'online' && gameSession) {
      setBoard(gameSession.board);
      setCurrentPlayer(gameSession.currentPlayer);
      
      if (gameSession.status === 'completed' && gameSession.winner !== null) {
        setGameOver(true);
        if (gameSession.winner === 1) {
          setLightScore(prev => prev + 1);
        } else if (gameSession.winner === -1) {
          setDarkScore(prev => prev + 1);
        }
      }
    }
  }, [gameMode, gameSession]);

  useEffect(() => {
    if (gameMode === 'single' && currentPlayer === -1 && gameStarted && !gameOver) {
      const timeoutId = setTimeout(() => {
        saveMoveToHistory();
        
        const aiMove = makeAIMove(board, difficultyLevel);
        if (aiMove) {
          const [startRow, startCol, endRow, endCol] = aiMove;
          const newBoard = executeMove(board, startRow, startCol, endRow, endCol);
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
                let currentBoard = JSON.parse(JSON.stringify(newBoard));
                let currentRow = endRow;
                let currentCol = endCol;
                
                for (let i = 1; i < bestSequence.length; i++) {
                  const [nextRow, nextCol] = bestSequence[i];
                  
                  ((i, currentRow, currentCol, nextRow, nextCol, prevBoard) => {
                    setTimeout(() => {
                      const updatedBoard = executeMove(
                        JSON.parse(JSON.stringify(prevBoard)),
                        currentRow, 
                        currentCol, 
                        nextRow, 
                        nextCol
                      );
                      setBoard(updatedBoard);
                      
                      if (i === bestSequence.length - 1) {
                        checkForKingPromotion(updatedBoard);
                        setCurrentPlayer(1);
                        checkGameOver(updatedBoard, 1);
                      }
                    }, 300 * i);
                  })(i, currentRow, currentCol, nextRow, nextCol, currentBoard);
                  
                  currentBoard = executeMove(currentBoard, currentRow, currentCol, nextRow, nextCol);
                  currentRow = nextRow;
                  currentCol = nextCol;
                }
                
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
    
    if (gameMode === 'online' && onlineSessionId) {
      makeMove(onlineSessionId, board, currentPlayer, true, winner);
    }
    
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
    if (moveHistory.length === 0 || gameMode === 'online') return;
    
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
    if (!gameStarted || gameOver) return;
    
    // In online mode, only allow moves on your turn
    if (gameMode === 'online') {
      if (onlineState.playerRole !== currentPlayer) {
        toast.error("It's not your turn");
        return;
      }
    } else if (gameMode === 'single' && currentPlayer === -1) {
      return; // Don't allow moves during AI's turn
    }

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
            finishMove(newBoard);
          }
        } else {
          finishMove(newBoard);
        }
      } else if (captureInProgress) {
        toast.error("You must complete a capture sequence!");
      } else if (isValidMove(board, startRow, startCol, row, col)) {
        saveMoveToHistory();
        
        const newBoard = executeMove(board, startRow, startCol, row, col);
        setBoard(newBoard);
        checkForKingPromotion(newBoard);
        finishMove(newBoard);
      } else {
        setSelectedPiece(null);
        setActiveSequence(null);
      }
    }
  };
  
  const finishMove = (newBoard: number[][]) => {
    setSelectedPiece(null);
    setActiveSequence(null);
    setCaptureInProgress(false);
    const nextPlayer = currentPlayer === 1 ? -1 : 1;
    setCurrentPlayer(nextPlayer);
    
    // For online mode, update the game state in the database
    if (gameMode === 'online' && onlineSessionId) {
      makeMove(onlineSessionId, newBoard, nextPlayer);
    }
    
    checkGameOver(newBoard, nextPlayer);
  };

  const startNewGame = (mode: GameMode) => {
    if (mode === 'online') {
      setShowOnlineSetup(true);
      return;
    }
    
    completeStartNewGame(mode);
  };

  const completeStartNewGame = (mode: GameMode, sessionId: string | null = null) => {
    setGameMode(mode);
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setActiveSequence(null);
    setCurrentPlayer(1);
    setGameStarted(true);
    setMoveHistory([]);
    setGameOver(false);
    
    if (mode === 'online' && sessionId) {
      setOnlineSessionId(sessionId);
    } else {
      setOnlineSessionId(null);
    }
    
    setShowOnlineSetup(false);
  };

  const handleStartOnlineGame = (sessionId: string) => {
    completeStartNewGame('online', sessionId);
  };

  const resetGame = () => {
    // If in online mode, leave the game session
    if (gameMode === 'online' && onlineSessionId) {
      leaveGame();
    }
    
    setGameMode(null);
    setBoard(createInitialBoard());
    setSelectedPiece(null);
    setActiveSequence(null);
    setCurrentPlayer(1);
    setGameStarted(false);
    setMoveHistory([]);
    setGameOver(false);
    setOnlineSessionId(null);
    setShowOnlineSetup(false);
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
    onlineState,
    showOnlineSetup,
    handleSquareClick,
    startNewGame,
    resetGame,
    undoMove,
    resetScores,
    handleStartOnlineGame,
    cancelOnlineSetup: () => setShowOnlineSetup(false)
  };
};
