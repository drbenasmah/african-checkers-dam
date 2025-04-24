
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get environment variables with fallbacks to prevent runtime errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Define database types for TypeScript
export type Tables = {
  game_sessions: {
    id: string;
    board: string;
    current_player: 1 | -1;
    light_player_id: string | null;
    dark_player_id: string | null;
    last_move_time: string;
    status: 'waiting' | 'active' | 'completed';
    winner: 1 | -1 | 0 | null;
  };
};

// Create the Supabase client only if both URL and key are provided
export const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient<{Tables: Tables}>(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    toast.error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
    return false;
  }
  return true;
};
