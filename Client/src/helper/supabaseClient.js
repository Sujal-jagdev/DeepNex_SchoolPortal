import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rvkpcwkavhjxsnjxnnuv.supabase.co";
const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a3Bjd2thdmhqeHNuanhubnV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDY5MzkxNiwiZXhwIjoyMDYwMjY5OTE2fQ.wDjQRqFhImcS2S6SNPDSyFnjCM2OFq_wOhhmTsUkEn0";

// Create Supabase client with custom headers to fix 406 Not Acceptable error
export const supabase = createClient(supabaseUrl, apikey, {
    auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: window.localStorage
    }
});