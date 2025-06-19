import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { resetPassword } from '../services/supabaseClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [animateForm, setAnimateForm] = useState(false);

  // Animation effect
  useEffect(() => {
    setAnimateForm(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      toast.error('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        const errorMsg = 'Failed to send reset email: ' + resetError.message;
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      const successMsg = 'Password reset instructions sent to your email!';
      setSuccess(successMsg);
      toast.success(successMsg);
      setLoading(false);
    } catch (err) {
      const errorMsg = 'Failed to send reset email: ' + (err.message || 'Please try again');
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-200 opacity-20 rounded-full w-96 h-96 -mt-24 -mr-24 filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-purple-200 opacity-20 rounded-full w-96 h-96 -mb-24 -ml-24 filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 left-1/4 bg-gradient-to-tr from-pink-200 opacity-20 rounded-full w-72 h-72 filter blur-xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 ease-in-out ${animateForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-6">
            <div className="flex flex-col items-center justify-center">
              <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-16 w-auto mb-4" />
              <h2 className="text-2xl font-bold text-center text-white font-display">
                Reset Your <span className="text-bright-green">EduNex</span> Password
              </h2>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-sm">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p>{success}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Enter your email address below and we'll send you instructions to reset your password.
                  </p>
                </div>
                
                <div className="relative">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    placeholder="Enter your email"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-6">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : 'Send Reset Instructions'}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Remember your password? <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-all duration-300">Back to Login</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;