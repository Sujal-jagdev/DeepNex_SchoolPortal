import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, signInWithGoogle, resetPassword, checkUserRole } from '../services/supabaseClient';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [animateForm, setAnimateForm] = useState(false);

  // Add animation effect when component mounts
  useEffect(() => {
    setAnimateForm(true);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Clear any previous errors
    setError('');
    setLoading(true);
    
    try {
      // Sign in with Supabase
      const { data, error: signInError } = await signIn(email, password);
      
      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setError(
            'Your email has not been verified yet. Please check your inbox and click the verification link. ' +
            'If you did not receive the email, check your spam folder or try signing up again.'
          );
        } else {
          setError('Login failed: ' + signInError.message);
        }
        setLoading(false);
        return;
      }
      
      if (data && data.user) {
        const userId = data.user.id;
        
        // Store userId in localStorage
        localStorage.setItem('userId', userId);
        
        // Check user role from database tables
        const { userRole, userData, multipleRoles, availableRoles, teacherStatus, statusMessage } = await checkUserRole(userId);
        
        // Check if user has multiple roles
        if (multipleRoles) {
          setError(`Your email can be used to login with the following roles: ${availableRoles.join(', ')}. Please use only one role.`);
          setLoading(false);
          return;
        }
        
        // Check if teacher status is pending or rejected
        if (teacherStatus === 'pending' || teacherStatus === 'rejected') {
          setError(statusMessage);
          setLoading(false);
          return;
        }
        
        if (userRole) {
          // Call the onLogin function passed from App.jsx
          onLogin(userRole);
          // Redirect to the appropriate dashboard
          navigate(`/dashboard/${userRole}`);
        } else {
          // If no role found in any table, show error
          setError('User role not found. Please contact administrator.');
          setLoading(false);
        }
      } else {
        setError('Login failed: User data not found');
        setLoading(false);
      }
    } catch (err) {
      setError('Login failed: ' + (err.message || 'Please try again'));
      setLoading(false);
    }
  };
  
  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call the signInWithGoogle function which initiates the OAuth flow
      // This will redirect the user to Google's login page
      const { error } = await signInWithGoogle();
      
      // If there's an error initiating the OAuth flow, display it
      if (error) {
        setError('Google sign-in failed: ' + error.message);
        setLoading(false);
        return;
      }
      
      // If successful, the page will be redirected to Google's login
      // The actual authentication handling will happen in the callback
      
      // Keep loading state true as we're about to redirect
      // No need to set loading to false as we're leaving this page
    } catch (err) {
      setError('Google sign-in failed: ' + (err.message || 'Please try again'));
      setLoading(false);
    }
  };
  
  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Use Supabase resetPassword function
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setError('Failed to send reset email: ' + error.message);
        setLoading(false);
        return;
      }
      
      setResetSuccess('Password reset instructions sent to your email!');
      setLoading(false);
    } catch (err) {
      setError('Failed to send reset email: ' + (err.message || 'Please try again'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 text-black">
      <div className="w-full max-w-md px-4">
        <div 
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ${animateForm ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        > 
          <div className="bg-gradient-to-r from-primary to-indigo-600 py-6 px-6 relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              {/* Abstract pattern overlay */}
              <div className="absolute inset-0 bg-pattern-dots"></div>
            </div>
            <div className="flex flex-col items-center justify-center relative z-10">
              <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-16 w-auto mb-4" />
              <h2 className="text-2xl font-bold text-center text-white font-display">
                Welcome to <span className="text-bright-green">EduNex</span>
              </h2>
              <p className="text-center text-blue-100 mt-2">
                Sign in to access your account
              </p>
            </div>
          </div>
          
          <div className="p-8">
            {!showForgotPassword ? (
              // Login Form
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4 animate-pulse">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-gray-700 font-medium text-sm">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-gray-700 font-medium text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-black"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <div>
                    <button 
                      type="button" 
                      onClick={() => setShowForgotPassword(true)}
                      className="text-primary hover:text-indigo-700 font-medium transition-colors duration-200"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all duration-200"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                      </g>
                    </svg>
                    Sign in with Google
                  </button>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    Don't have an account? <Link to="/signup" className="text-primary hover:text-indigo-700 font-medium transition-colors duration-200">Sign up</Link>
                  </p>
                </div>
              </form>
            ) : (
              // Forgot Password Form
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4 animate-pulse">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                
                {resetSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-4 animate-pulse">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p>{resetSuccess}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="resetEmail" className="block text-gray-700 font-medium text-sm">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="resetEmail"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-black"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                      setResetSuccess('');
                      setError('');
                    }}
                    className="text-primary hover:text-indigo-700 font-medium transition-colors duration-200"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;