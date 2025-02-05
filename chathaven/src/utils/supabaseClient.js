import { createClient } from '@supabase/supabase-js';

// URL and KEY stored in environment variables for security 
// DM William Ma/kindatired for URL and KEY
// create a file called .env in root project folder
// in that file put:
// REACT_APP_SUPABASE_URL=[paste URL]
// REACT_APP_SUPABASE_ANON_KEY=[paste KEY]
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
