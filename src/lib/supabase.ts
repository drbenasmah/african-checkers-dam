
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get environment variables with fallbacks to prevent runtime errors
// Using the values from src/integrations/supabase/client.ts directly
const supabaseUrl = "https://vnvkeuzdqxgfcdztzmrj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudmtldXpkcXhnZmNkenR6bXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzI5MzcsImV4cCI6MjA2MDc0ODkzN30.iuhg9UqT-u84hqFhgadqZeNCfIrXOofHWc7jZhkkNNo";

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

// Create the Supabase client with the fixed URL and key
export const supabaseClient = createClient<{Tables: Tables}>(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    toast.error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
    return false;
  }
  return true;
};
