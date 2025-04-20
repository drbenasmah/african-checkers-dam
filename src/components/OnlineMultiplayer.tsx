
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOnlineMultiplayer } from '@/hooks/useOnlineMultiplayer';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, X } from 'lucide-react';
import { supabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

interface OnlineMultiplayerProps {
  onGameStart: (sessionId: string) => void;
  onCancel: () => void;
}

const OnlineMultiplayer: React.FC<OnlineMultiplayerProps> = ({ onGameStart, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const {
    onlineState,
    createGameSession,
    joinGameSession,
    findAvailableGames,
  } = useOnlineMultiplayer();
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    // Only run if Supabase is configured
    if (isSupabaseConfigured()) {
      checkAuth();
    } else {
      toast.error("Supabase configuration is missing. Please add your Supabase URL and anon key.");
    }
  }, []);
  
  useEffect(() => {
    // If we have a session ID and we're not waiting for an opponent, start the game
    if (onlineState.sessionId && !onlineState.waitingForOpponent) {
      onGameStart(onlineState.sessionId);
    }
  }, [onlineState, onGameStart]);
  
  const loadAvailableGames = async () => {
    setIsLoading(true);
    const games = await findAvailableGames();
    setAvailableGames(games);
    setIsLoading(false);
  };
  
  const handleCreateGame = async () => {
    setIsLoading(true);
    const sessionId = await createGameSession();
    setIsLoading(false);
    
    if (sessionId) {
      // Wait for opponent - handled by the useEffect above
    }
  };
  
  const handleJoinGame = async (sessionId: string) => {
    setIsLoading(true);
    const success = await joinGameSession(sessionId);
    setIsLoading(false);
    
    if (success) {
      // Game will start - handled by the useEffect above
    }
  };
  
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Sign in failed. Please check your credentials.");
    }
    setIsLoading(false);
  };
  
  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabaseClient.auth.signUp({
        email, 
        password,
        options: { 
          data: { username } 
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created! Please check your email to confirm your account.");
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Sign up failed. Please try again.");
    }
    setIsLoading(false);
  };
  
  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    setIsAuthenticated(false);
  };
  
  // If user is not authenticated, show auth forms
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? "Create an Account" : "Sign In"}
        </h2>
        
        {isSignUp && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>
        
        <Button
          onClick={isSignUp ? handleSignUp : handleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        
        <p className="text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 text-blue-600 hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
        
        <Button variant="outline" onClick={onCancel} className="mt-4">
          Cancel
        </Button>
      </div>
    );
  }
  
  // If waiting for opponent
  if (onlineState.waitingForOpponent) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center">Waiting for Opponent</h2>
        <p className="text-center">Share this game ID with your friend:</p>
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
          <code className="flex-1 text-center font-mono text-sm">
            {onlineState.sessionId}
          </code>
        </div>
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Online Multiplayer</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <Button onClick={handleCreateGame} disabled={isLoading} className="w-full">
        Create New Game
      </Button>
      
      <Separator className="my-2" />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Join Game</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadAvailableGames}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={sessionIdInput}
            onChange={(e) => setSessionIdInput(e.target.value)}
            placeholder="Enter Game ID"
            className="flex-1"
          />
          <Button
            onClick={() => handleJoinGame(sessionIdInput)}
            disabled={!sessionIdInput || isLoading}
          >
            Join
          </Button>
        </div>
      </div>
      
      {availableGames.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium">Available Games:</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableGames.map((game) => (
              <div
                key={game.id}
                className="flex justify-between items-center p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                onClick={() => handleJoinGame(game.id)}
              >
                <span className="text-sm font-mono truncate">{game.id}</span>
                <span className="text-xs text-gray-500">
                  {new Date(game.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-center text-gray-500 mt-4">
          No games available. Click "Refresh" to check again.
        </p>
      )}
      
      <div className="flex justify-between mt-4">
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default OnlineMultiplayer;
