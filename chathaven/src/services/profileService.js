import { supabase } from "../utils/supabaseClient"; // adjust the path as needed

/**
 * Inserts a new row into the profiles table.
 *
 * @param {Object} profileData - An object containing the profile information.
 * @param {string} profileData.id - The user id (UUID) returned from auth.
 * @param {string} profileData.username - The username provided during sign up.
 * @param {string} profileData.password - The password provided during sign up.
 * @param {string} profileData.role - The user role ("Member" or "Admin").
 *
 * @returns {Promise<{data: any, error: any}>} - The result of the insert operation.
 */
export const createProfile = async ({ id, username, password, role, email }) => {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        id,
        username,
        password, // In production, store a hash, not the raw password.
        role,
        email,
      },
    ]);
  return { data, error };
};

export const getProfileByUsername = async (username) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username);
    return { data, error };
  };
