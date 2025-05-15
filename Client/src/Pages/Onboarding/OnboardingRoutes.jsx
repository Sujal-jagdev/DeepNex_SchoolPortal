import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../../helper/supabaseClient';
import StudentOnboarding from './StudentOnboarding';
import TeacherOnboarding from './TeacherOnboarding';
import HODOnboarding from './HODOnboarding';
import AdminOnboarding from './AdminOnboarding';
import { Loader2 } from 'lucide-react';

// This component handles routing to the appropriate onboarding form
// and protects onboarding routes from unauthorized access
const OnboardingRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          // Redirect to login if not authenticated
          navigate('/login');
          return;
        }
        
        setUser(session.user);
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route path="/student" element={<StudentOnboarding />} />
      <Route path="/teacher" element={<TeacherOnboarding />} />
      <Route path="/hod" element={<HODOnboarding />} />
      <Route path="/admin" element={<AdminOnboarding />} />
      {/* Default redirect if no specific route matches */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default OnboardingRoutes;