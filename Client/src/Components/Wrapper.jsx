import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { MyContext } from '../AllContext';
import { getCurrentSession, getUserRole } from '../helper/authUtils';
import { isPublicRoute, hasRoutePermission, getRedirectPathForRole } from '../helper/routeUtils';

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
                // Get current session
                const { session, error: sessionError } = await getCurrentSession();

                if (!session) {
                    setAuthState({ authenticated: false, userRole: null, userData: null, loading: false });
                    return;
                }

                // Get user role from database
                const { role, userData, approvalStatus } = await getUserRole(session.user.email);

                // Update global role context if role exists
                if (role && role !== 'new' && role !== 'pending') {
                    setrole(role);
                }

                // Set auth state with role information
                setAuthState({
                    authenticated: true,
                    userRole: role,
                    userData: role === 'pending' ? { ...session.user, approvalStatus } : userData,
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
    }, [location.pathname, setrole]);

    // Loading state
    if (authState.loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    // Public routes don't require auth
    if (isPublicRoute(location.pathname) && !location.pathname.includes('/profile-completion')) {
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
            const redirectPath = getRedirectPathForRole(authState.userRole);
            return <Navigate to={redirectPath} state={{ from: location }} replace />;
        }
    }

    // Handle new users who need profile completion
    if (authState.userRole === 'new' && location.pathname !== '/profile-completion') {
        return <Navigate to="/profile-completion" state={{ from: location }} replace />;
    }

    // Handle pending teachers
    if (authState.userRole === 'pending') {
        // Show a pending approval page
        return <div className="flex flex-col justify-center items-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Account Pending Approval</h1>
            <p className="text-gray-600">Your account is {authState.userData?.approvalStatus || 'pending'} approval.</p>
            <button 
                onClick={() => {
                    // Import dynamically to avoid circular dependency
                    import('../helper/authUtils').then(({ signOutUser }) => {
                        signOutUser().then(() => window.location.href = '/login');
                    });
                }}
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
    if (!hasRoutePermission(authState.userRole, location.pathname)) {
        // Redirect based on role
        const redirectPath = getRedirectPathForRole(authState.userRole);
        return <Navigate to={redirectPath} replace />;
    }

    // Pass user data as props to children
    return React.cloneElement(children, { userData: authState.userData });
};

export default Wrapper;
