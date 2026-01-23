/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zoeibulnszdandjkjgcp.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZWlidWxuc3pkYW5kamtqZ2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMjA0NjAsImV4cCI6MjA4NDY5NjQ2MH0.U9teCpW8J_4AkWQI3aFYRATneH4F5T2yq5HGNixq8v4";

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
