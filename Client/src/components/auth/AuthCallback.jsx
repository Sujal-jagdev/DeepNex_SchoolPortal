import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../../services/supabaseClient';
import { toast } from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // Process the auth callback
        const { error, success } = await handleAuthCallback();

        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message || 'Authentication failed');
          toast.error(error.message || 'Authentication failed');
          // Redirect to login page after error
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        if (success) {
          // The handleAuthCallback function will handle the redirect
          // We don't need to do anything here
          console.log('Auth callback successful, redirecting...');
        } else {
          // If no success and no error, something unexpected happened
          setError('Authentication process incomplete');
          toast.error('Authentication process incomplete');
          // Redirect to login page
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err) {
        console.error('Auth callback processing error:', err);
        setError('Authentication failed: ' + (err.message || 'Please try again'));
        toast.error('Authentication failed: ' + (err.message || 'Please try again'));
        // Redirect to login page after error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    processAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Processing Authentication</h2>
            <p className="text-gray-500">Please wait while we complete your sign-in...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
            <p className="text-gray-500 mt-4">Redirecting to login page...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-700">Authentication successful!</p>
            </div>
            <p className="text-gray-500 mt-4">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;