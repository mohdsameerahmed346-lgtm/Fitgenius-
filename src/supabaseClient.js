import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://irkawpuduapwhrzstnvm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlya2F3cHVkdWFwd2hyenN0bnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjM1NTUsImV4cCI6MjA5MzM5OTU1NX0.W5rONJZVKDC0ucCVhfXrxBiBd9Z78SGwoi7yOuUTEgA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
