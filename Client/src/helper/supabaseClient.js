import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing!');
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: window.localStorage,
        // Ensure email verification works properly
        emailRedirectTo: `${window.location.origin}/confirm-registration`,
        // Debug mode for development
        debug: import.meta.env.DEV
    },
    // Global error handler
    global: {
        fetch: (...args) => fetch(...args)
            .catch(error => {
                console.error('Supabase fetch error:', error);
                throw error;
            })
    }
});

// Log successful initialization
console.log('Supabase client initialized with URL:', supabaseUrl);