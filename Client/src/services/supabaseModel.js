import { supabase } from './supabaseClient';

// Function to get the current auth session
export const getAuthSession = async () => {
  try {
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting auth session:', error);
      return { session: null, error };
    }
    
    if (!session) {
      return { session: null, error: null };
    }
    
    // Get user data from the appropriate table based on role
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    if (!userRole || !userId) {
      return { 
        session, 
        userData: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'उपयोगकर्ता'
        } 
      };
    }
    
    // Get user data from the appropriate table
    const { data: userData, error: userError } = await supabase
      .from(userRole)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error getting user data:', userError);
      return { 
        session, 
        userData: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || 'उपयोगकर्ता'
        },
        error: userError 
      };
    }
    
    return { session, userData, error: null };
  } catch (err) {
    console.error('Exception getting auth session:', err);
    return { session: null, error: err };
  }
};

// Function to update user profile data
export const updateUserProfile = async (userRole, userId, updates) => {
  try {
    // Update user data in the appropriate table
    const { data, error } = await supabase
      .from(userRole)
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
    
    // Update localStorage with new user data if name or email is updated
    if (updates.name) {
      localStorage.setItem('userName', updates.name);
    }
    if (updates.email) {
      localStorage.setItem('userEmail', updates.email);
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception updating user profile:', err);
    return { data: null, error: err };
  }
};