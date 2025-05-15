import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { supabase } from '../helper/supabaseClient';
import { MyContext } from '../AllContext';

// Define public routes (no authentication needed)
const publicRoutes = ['/', '/login', '/signup', '/about', '/courses', '/update-password', '/profile-completion'];

// Define role-based access for protected routes
const routeAccess = {
    '/student-profile': ['student'],
    '/studentchat': ['student'],
    '/teacher-profile': ['teacher'],
    '/teacherportal': ['teacher'],
    '/teacher-dashboard': ['teacher'],
    '/dashboard': ['teacher', 'hod', 'admin'],
    '/trustee-dashboard': ['admin'],
    '/hods': ['admin'],
    '/doctors': ['admin']
};

const Wrapper = ({ children }) => {
    const [authState, setAuthState] = useState({
        authenticated: false,
        userRole: null,
        userData: null,
        loading: true
    });

    const location = useLocation();
    const { setrole } = useContext(MyContext);

    useEffect(() => {
        const checkAuthAndRole = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setAuthState({ authenticated: false, userRole: null, userData: null, loading: false });
                    return;
                }

                // Handle special case for profile completion page
                if (location.pathname === '/profile-completion') {
                    setAuthState({
                        authenticated: true,
                        userRole: 'pending',
                        userData: session.user,
                        loading: false
                    });
                    return;
                }

                let userRole = null;
                let userData = null;

                // Check admin table
                const { data: adminData, error: adminError } = await supabase
                    .from('admin')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();

                if (adminData && !adminError) {
                    userRole = 'admin';
                    userData = adminData;
                    setrole('admin');
                } else {
                    // Check HOD
                    const { data: hodData, error: hodError } = await supabase
                        .from('hod')
                        .select('*')
                        .eq('email', session.user.email)
                        .single();

                    if (hodData && !hodError) {
                        userRole = 'hod';
                        userData = hodData;
                        setrole('hod');
                    } else {
                        // Check teacher
                        const { data: teacherData, error: teacherError } = await supabase
                            .from('teacher')
                            .select('*')
                            .eq('email', session.user.email)
                            .single();

                        if (teacherData && !teacherError) {
                            userRole = 'teacher';
                            userData = teacherData;
                            setrole('teacher');
                        } else {
                            // Check student
                            const { data: studentData, error: studentError } = await supabase
                                .from('student')
                                .select('*')
                                .eq('email', session.user.email)
                                .single();

                            if (studentData && !studentError) {
                                userRole = 'student';
                                userData = studentData;
                                setrole('student');
                            }
                        }
                    }
                }

                // If no role is found, check for pending approval or redirect to profile completion
                if (!userRole) {
                    // Check if user has a pending teacher approval
                    const { data: approvalData, error: approvalError } = await supabase
                        .from('teacher_approvals')
                        .select('status')
                        .eq('teacher_email', session.user.email)
                        .single();
                    
                    if (approvalData && !approvalError) {
                        userRole = 'pending';
                        userData = { ...session.user, approvalStatus: approvalData.status };
                        // Redirect to appropriate page based on approval status
                        setAuthState({
                            authenticated: true,
                            userRole,
                            userData,
                            loading: false
                        });
                        return;
                    }
                    
                    // User authenticated but not in any role table - redirect to profile completion
                    setAuthState({
                        authenticated: true,
                        userRole: 'new',
                        userData: session.user,
                        loading: false
                    });
                    
                    if (location.pathname !== '/profile-completion') {
                        // Only redirect if not already on profile completion
                        window.location.href = '/profile-completion';
                        return;
                    }
                    return;
                }

                setAuthState({
                    authenticated: true,
                    userRole,
                    userData,
                    loading: false
                });

            } catch (error) {
                console.error('Authentication error:', error);
                setAuthState({
                    authenticated: false,
                    userRole: null,
                    userData: null,
                    loading: false
                });
            }
        };

        checkAuthAndRole();
    }, [location.pathname]);

    // Loading state
    if (authState.loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Public routes don't require auth
    if (publicRoutes.includes(location.pathname)) {
        return <>{children}</>;
    }

    // Handle new users who need profile completion
    if (authState.userRole === 'new' && location.pathname !== '/profile-completion') {
        return <Navigate to="/profile-completion" state={{ from: location }} replace />;
    }

    // Handle pending teachers
    if (authState.userRole === 'pending') {
        // You might want to show a pending approval page
        return <div className="flex flex-col justify-center items-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
            <p className="text-gray-600">Your account is {authState.userData?.approvalStatus || 'pending'} approval.</p>
            <button 
                onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Sign Out
            </button>
        </div>;
    }

    // Redirect to login if not authenticated
    if (!authState.authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user's role is allowed on this route
    const hasPermission = () => {
        const allowedRoles = routeAccess[location.pathname];
        if (!allowedRoles) return true; // Route not listed means no restriction
        return allowedRoles.includes(authState.userRole);
    };

    if (!hasPermission()) {
        // Redirect based on role
        let redirectPath = '/';
        switch (authState.userRole) {
            case 'student':
                redirectPath = '/student-profile';
                break;
            case 'teacher':
                redirectPath = '/dashboard';
                break;
            case 'hod':
                redirectPath = '/dashboard';  // Changed from '/hod-dashboard'
                break;
            case 'admin':
                redirectPath = '/dashboard';
                break;
            default:
                redirectPath = '/';
        }
        return <Navigate to={redirectPath} replace />;
    }

    // Pass user data as props to children
    return React.cloneElement(children, { userData: authState.userData });
};

export default Wrapper;
