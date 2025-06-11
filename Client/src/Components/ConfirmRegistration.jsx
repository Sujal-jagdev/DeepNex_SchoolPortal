import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../helper/supabaseClient';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const ConfirmRegistration = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmRegistration = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = location.hash;
        
        // If there's no hash, the user might have navigated here directly
        if (!hash) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and click the link provided.');
          return;
        }

        // Get the current session to check if the user is already confirmed
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is already confirmed and logged in
          setUserEmail(session.user.email);
          setStatus('success');
          setMessage('Your email has been confirmed successfully!');
          return;
        }

        // If we get here, we need to process the hash from the URL
        // The hash contains the access_token and other parameters
        const params = new URLSearchParams(hash.substring(1)); // Remove the # character
        const type = params.get('type');

        if (type === 'signup') {
          // This is a signup confirmation
          setStatus('success');
          setMessage('Your email has been confirmed successfully! You can now log in.');
        } else if (type === 'recovery') {
          // This is a password reset
          setStatus('success');
          setMessage('Your password has been reset successfully! You can now log in with your new password.');
        } else {
          // Unknown confirmation type
          setStatus('error');
          setMessage('Unknown confirmation type. Please try logging in or contact support.');
        }
      } catch (error) {
        console.error('Error confirming registration:', error);
        setStatus('error');
        setMessage('An error occurred while confirming your registration. Please try again or contact support.');
      }
    };

    confirmRegistration();
  }, [location]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verification</h2>
          
          {status === 'loading' && (
            <div className="mt-8 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="mt-4 text-lg text-gray-600">Verifying your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-8">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="mt-4 text-lg text-gray-600">{message}</p>
              {userEmail && (
                <p className="mt-2 text-sm text-gray-500">Verified email: {userEmail}</p>
              )}
              <button
                onClick={handleGoToLogin}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-8">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <p className="mt-4 text-lg text-gray-600">{message}</p>
              <button
                onClick={handleGoToLogin}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmRegistration;