import { supabase } from '../utils/supabaseClient';

// Sign in with email and password
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Sign up with email, password, and optional additional data (e.g., username)
export async function signUpWithEmail(email, password, additionalData = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: additionalData, // extra user metadata stored in the auth user record
    },
  });
  return { data, error };
}

// Sign in with Google (or other OAuth providers)
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
}

// Sign out the current user
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return error;
}
