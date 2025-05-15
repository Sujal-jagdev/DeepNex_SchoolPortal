import React from 'react';
import { supabase } from '../helper/supabaseClient';

const SignInWith = (provider) => async () => {
  try {
    const auth_callback_url = `${import.meta.env.VITE_SITE_URL}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: auth_callback_url,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('OAuth sign-in error:', err.message);
  }
};

const SignInButton = () => {
  const handleSignIn = SignInWith('google');

  return (
    <button
      onClick={handleSignIn}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    >
      Sign in with Google
    </button>
  );
};

export default SignInButton;