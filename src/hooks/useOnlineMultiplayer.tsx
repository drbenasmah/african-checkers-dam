import { useState, useEffect } from 'react';
import { supabaseClient } from "@/lib/supabase";
import { toast } from 'sonner';

export type GameSession = {
  id: string;
  board: number[][];
  currentPlayer: 1 | -1;
  lightPlayerId: string | null;
  darkPlayerId: string | null;
  lastMoveTime: string;
  status: 'waiting' | 'active' | 'completed';
  winner: 1 | -1 | 0 | null;
};

export type OnlineGameState = {
  sessionId: string | null;
  isHost: boolean;
  playerRole: 1 | -1 | null;
  opponentId: string | null;
  waitingForOpponent: boolean;
};

export const useOnlineMultiplayer = () => {
  const [onlineState, setOnlineState] = useState<OnlineGameState>({
    sessionId: null,
    isHost: false,
    playerRole: null,
    opponentId: null,
    waitingForOpponent: false,
  });
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const getUserId = async () => {
    try {
      const { data } = await supabaseClient.auth.getUser();
      return data?.user?.id;
    } catch (error) {
      toast.error("Error getting user ID");
      return null;
    }
  };

  const createGameSession = async () => {
    const userId = await getUserId();
    if (!userId) {
      toast.error("You need to be logged in to create a game");
      return null;
    }

    try {
      const { data, error } = await supabaseClient
        .from('game_sessions')
        .insert({
          board: JSON.stringify(Array(10).fill().map(() => Array(10).fill(0))), // Empty board placeholder
          current_player: 1,
          light_player_id: userId,
          dark_player_id: null,
          last_move_time: new Date().toISOString(),
          status: 'waiting',
          winner: null
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      const session: GameSession = {
        id: data.id,
        board: JSON.parse(data.board),
        currentPlayer: data.current_player,
        lightPlayerId: data.light_player_id,
        darkPlayerId: data.dark_player_id,
        lastMoveTime: data.last_move_time,
        status: data.status,
        winner: data.winner
      };

      setGameSession(session);
      setOnlineState({
        sessionId: data.id,
        isHost: true,
        playerRole: 1, // Host plays as light
        opponentId: null,
        waitingForOpponent: true,
      });

      // Subscribe to changes for this session
      subscribeToGameSession(data.id);
      
      toast.success("Game created! Waiting for an opponent to join.");
      return data.id;
    } catch (error) {
      console.error("Error creating game session:", error);
      toast.error("Failed to create game. Please try again.");
      return null;
    }
  };

  const joinGameSession = async (sessionId: string) => {
    const userId = await getUserId();
    if (!userId) {
      toast.error("You need to be logged in to join a game");
      return false;
    }

    try {
      // First check if the session exists and is available
      const { data: sessionData, error: sessionError } = await supabaseClient
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('status', 'waiting')
        .single();

      if (sessionError || !sessionData) {
        toast.error("Game session not found or no longer available");
        return false;
      }

      // Update the session with the joining player
      const { data, error } = await supabaseClient
        .from('game_sessions')
        .update({
          dark_player_id: userId,
          status: 'active'
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from update");

      const session: GameSession = {
        id: data.id,
        board: JSON.parse(data.board),
        currentPlayer: data.current_player,
        lightPlayerId: data.light_player_id,
        darkPlayerId: data.dark_player_id,
        lastMoveTime: data.last_move_time,
        status: data.status,
        winner: data.winner
      };

      setGameSession(session);
      setOnlineState({
        sessionId: data.id,
        isHost: false,
        playerRole: -1, // Joining player plays as dark
        opponentId: data.light_player_id,
        waitingForOpponent: false,
      });

      // Subscribe to changes for this session
      subscribeToGameSession(sessionId);
      
      toast.success("Successfully joined the game!");
      return true;
    } catch (error) {
      console.error("Error joining game session:", error);
      toast.error("Failed to join game. Please try again.");
      return false;
    }
  };

  const makeMove = async (
    sessionId: string,
    board: number[][],
    currentPlayer: 1 | -1,
    isGameOver: boolean = false,
    winner: 1 | -1 | null = null
  ) => {
    if (!supabaseClient) {
      toast.error("Supabase client not initialized");
      return false;
    }
    
    try {
      const { error } = await supabaseClient
        .from('game_sessions')
        .update({
          board: JSON.stringify(board),
          current_player: currentPlayer,
          last_move_time: new Date().toISOString(),
          status: isGameOver ? 'completed' : 'active',
          winner: winner
        })
        .eq('id', sessionId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error updating game state:", error);
      toast.error("Failed to update game. Please try again.");
      return false;
    }
  };

  const subscribeToGameSession = (sessionId: string) => {
    try {
      const channel = supabaseClient
        .channel(`game_session:${sessionId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        }, (payload: any) => {
          const updatedSession = {
            id: payload.new.id,
            board: JSON.parse(payload.new.board),
            currentPlayer: payload.new.current_player,
            lightPlayerId: payload.new.light_player_id,
            darkPlayerId: payload.new.dark_player_id,
            lastMoveTime: payload.new.last_move_time,
            status: payload.new.status,
            winner: payload.new.winner
          };
          
          setGameSession(updatedSession);
          
          // Update waiting status if someone joined
          if (onlineState.waitingForOpponent && payload.new.dark_player_id) {
            setOnlineState(prev => ({
              ...prev,
              waitingForOpponent: false,
              opponentId: payload.new.dark_player_id
            }));
            toast.success("Opponent joined the game!");
          }
          
          // Handle game completion
          if (payload.new.status === 'completed' && payload.new.winner !== null) {
            const didWin = payload.new.winner === onlineState.playerRole;
            toast[didWin ? 'success' : 'error'](
              didWin ? "You won the game!" : "You lost the game."
            );
          }
        })
        .subscribe(status => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to channel');
            setIsConnected(false);
          }
        });

      // Return unsubscribe function
      return () => {
        supabaseClient.removeChannel(channel);
        setIsConnected(false);
      };
    } catch (error) {
      console.error("Error subscribing to game session:", error);
      toast.error("Failed to connect to game updates");
      return () => {};
    }
  };

  const findAvailableGames = async () => {
    if (!supabaseClient) {
      toast.error("Supabase client not initialized");
      return [];
    }
    
    try {
      const { data, error } = await supabaseClient
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('last_move_time', { ascending: false });

      if (error) throw error;
      
      return data ? data.map(session => ({
        id: session.id,
        createdAt: session.last_move_time,
        hostId: session.light_player_id
      })) : [];
    } catch (error) {
      console.error("Error finding available games:", error);
      toast.error("Failed to load available games");
      return [];
    }
  };

  const leaveGame = async () => {
    if (!supabaseClient || !onlineState.sessionId || !gameSession) return;
    
    try {
      // If the game is still waiting for an opponent, delete it
      if (gameSession.status === 'waiting') {
        await supabaseClient
          .from('game_sessions')
          .delete()
          .eq('id', onlineState.sessionId);
      } else {
        // Otherwise, mark the game as complete with the opponent as winner
        const winner = onlineState.playerRole === 1 ? -1 : 1;
        await supabaseClient
          .from('game_sessions')
          .update({
            status: 'completed',
            winner: winner
          })
          .eq('id', onlineState.sessionId);
      }
      
      // Reset state
      setOnlineState({
        sessionId: null,
        isHost: false,
        playerRole: null,
        opponentId: null,
        waitingForOpponent: false,
      });
      setGameSession(null);
      
      toast.success("You've left the game");
    } catch (error) {
      console.error("Error leaving game:", error);
      toast.error("Failed to leave game properly");
    }
  };

  useEffect(() => {
    // Cleanup subscription on unmount
    return () => {
      if (onlineState.sessionId) {
        supabaseClient.channel(`game_session:${onlineState.sessionId}`).unsubscribe();
      }
    };
  }, [onlineState.sessionId]);

  return {
    onlineState,
    gameSession,
    isConnected,
    createGameSession,
    joinGameSession,
    makeMove,
    findAvailableGames,
    leaveGame
  };
};
