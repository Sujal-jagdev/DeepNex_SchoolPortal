import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication functions
export const signUp = async (email, password) => {
  try {
    const response = await authApi.post('/signup', { email, password });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const response = await authApi.post('/signin', { email, password });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

export const signOut = async () => {
  try {
    const response = await authApi.post('/signout');
    return { error: null };
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    const response = await authApi.post('/reset-password', { email });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

export const updatePassword = async (newPassword) => {
  try {
    const response = await authApi.post('/update-password', { newPassword });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

// User data functions
export const insertUserData = async (table, userData) => {
  try {
    const response = await authApi.post('/user-data', { table, userData });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

export const getUserData = async (table, userId) => {
  try {
    const response = await authApi.get(`/user-data/${table}/${userId}`);
    return { data: response.data.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

export const updateUserData = async (table, userId, updates) => {
  try {
    const response = await authApi.put(`/user-data/${table}/${userId}`, updates);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

export const deleteUserData = async (table, userId) => {
  try {
    const response = await authApi.delete(`/user-data/${table}/${userId}`);
    return { error: null };
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = window.location.origin + '/profile-completion';
    const response = await authApi.post('/google-signin', { redirectUrl });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

// Verify security PIN
export const verifySecurityPin = async (role, pin) => {
  try {
    const response = await authApi.post('/verify-pin', { role, pin });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error.message };
  }
};

// Export the API instance for custom calls
export default authApi;