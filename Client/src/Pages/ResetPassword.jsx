import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { updatePassword, supabase } from '../services/supabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user is authenticated with recovery token
  useEffect(() => {
    // Get the hash fragment from the URL
    const hashFragment = location.hash;
    
    if (hashFragment) {
      // The hash contains the access token and type
      // This is handled automatically by Supabase Auth
      // We just need to check if the user is authenticated
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      };
      
      checkSession();
    } else {
      // No hash fragment, user might have navigated here directly
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error: updateError } = await updatePassword(newPassword);
      
      if (updateError) {
        const errorMsg = 'Failed to update password: ' + updateError.message;
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      const successMsg = 'Password updated successfully!';
      setSuccess(successMsg);
      toast.success(successMsg);
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      const errorMsg = 'Failed to update password: ' + (err.message || 'Please try again');
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary py-4">
            <h2 className="text-2xl font-bold text-center text-white">
              Reset Your Password
            </h2>
          </div>
          
          <div className="p-6">
            {error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : success ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
                <p className="mt-2">Redirecting to login page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full btn btn-primary py-2"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;