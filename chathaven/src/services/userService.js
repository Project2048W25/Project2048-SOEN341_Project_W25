import { signUpWithEmail as supabaseSignUpWithEmail } from "./authService";
import { createProfile } from "./profileService";

/**
 * Signs up a new user and then creates their profile record.
 *
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {Object} extraData - Additional data such as username and role.
 * @param {string} extraData.username - The username provided.
 * @param {string} extraData.role - The user role ("Member" or "Admin").
 *
 * @returns {Promise<{data: any, error: any}>} - The combined result of auth and profile creation.
 */
export const signUpUser = async (email, password, { username, role }) => {
  // First, call the auth sign-up service.
  const { data, error } = await supabaseSignUpWithEmail(email, password, { username });
  if (error) return { data, error };

  // Assume that data.user contains the new user's info (including their id)
  const userId = data.user.id;

  // Insert additional details into the profiles table.
  const { data: profileData, error: profileError } = await createProfile({
    id: userId,
    username,
    password, // Again, do not store raw passwords in a production app!
    role,
    email,
  });
  if (profileError) return { data: profileData, error: profileError };

  return { data, error: null };
};
