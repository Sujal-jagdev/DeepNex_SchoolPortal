import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { supabase } from '../helper/supabaseClient';
import { MyContext } from '../AllContext';

// Define public routes (no authentication needed)
const publicRoutes = ['/', '/login', '/signup', '/about', '/courses', '/update-password'];

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

                // We'll handle profile-completion route after checking all tables

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
                    
                    // User authenticated but not in any role table
                    setAuthState({
                        authenticated: true,
                        userRole: 'new',
                        userData: session.user,
                        loading: false
                    });
                    
                    // If user is not on profile-completion page, redirect them there
                    if (location.pathname !== '/profile-completion') {
                        window.location.href = '/profile-completion';
                        return;
                    }
                    // If they are already on profile-completion, let them stay there
                    return;
                }

                // Check if user is trying to access profile-completion route
                if (location.pathname === '/profile-completion') {
                    // If user already has a role (exists in any table), redirect them to appropriate dashboard
                    let redirectPath = '/';
                    switch (userRole) {
                        case 'student':
                            redirectPath = '/student-profile';
                            break;
                        case 'teacher':
                            redirectPath = '/dashboard';
                            break;
                        case 'hod':
                            redirectPath = '/dashboard';
                            break;
                        case 'admin':
                            redirectPath = '/dashboard';
                            break;
                        default:
                            redirectPath = '/';
                    }
                    
                    // Redirect user away from profile-completion
                    window.location.href = redirectPath;
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
    
    // Special handling for profile-completion route
    if (location.pathname === '/profile-completion') {
        // If not authenticated, redirect to login
        if (!authState.authenticated) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
        
        // Only users with 'new' role (not in any table) can access profile-completion
        if (authState.userRole === 'new') {
            return <>{children}</>;
        } else {
            // Users who already have a role should be redirected to their dashboard
            let redirectPath = '/';
            switch (authState.userRole) {
                case 'student':
                    redirectPath = '/student-profile';
                    break;
                case 'teacher':
                    redirectPath = '/dashboard';
                    break;
                case 'hod':
                    redirectPath = '/dashboard';
                    break;
                case 'admin':
                    redirectPath = '/dashboard';
                    break;
                default:
                    redirectPath = '/';
            }
            return <Navigate to={redirectPath} state={{ from: location }} replace />;
        }
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
