/**
 * Centralized routing configuration for the application
 * This file defines all routes and their access permissions
 */

// Define public routes (no authentication needed)
export const publicRoutes = [
  { path: '/', component: 'Home' },
  { path: '/login', component: 'Login' },
  { path: '/signup', component: 'Register' },
  { path: '/about', component: 'About' },
  { path: '/courses', component: 'Courses' },
  { path: '/update-password', component: 'ResetPassword' },
  { path: '/teacherchat', component: 'TeacherChatBot' },
  { path: '/confirm-registration', component: 'ConfirmRegistration' },
  { path: '/profile-completion', component: 'ProfileCompletion', requiresAuth: true, allowedRoles: ['new'] }
];

// Define protected routes with role-based access
export const protectedRoutes = [
  // Student Routes
  { path: '/student-profile', component: 'StudentProfile', allowedRoles: ['student'] },
  { path: '/studentchat', component: 'StudentChat', allowedRoles: ['student'] },
  
  // Teacher Routes
  { path: '/teacher-profile', component: 'TeacherProfile', allowedRoles: ['teacher'] },
  { path: '/teacherportal', component: 'TeacherPortal', allowedRoles: ['teacher'] },
  { path: '/teacher-dashboard', component: 'TeacherDashboard', allowedRoles: ['teacher'] },
  
  // HOD Routes
  { path: '/hod-profile', component: 'HODProfile', allowedRoles: ['hod'] },
  { path: '/dashboard', component: 'HODDashboard', allowedRoles: ['hod'] },
  
  // Admin/Trustee Routes
  { path: '/trustee-dashboard', component: 'TrusteeDashboard', allowedRoles: ['admin'] },
  { path: '/doctors', component: 'Students', allowedRoles: ['admin'] }
];

// Get all routes (public + protected)
export const getAllRoutes = () => {
  return [...publicRoutes, ...protectedRoutes];
};

// Check if a route is public
export const isPublicRoute = (pathname) => {
  return publicRoutes.some(route => route.path === pathname);
};

// Check if a user has permission to access a route
export const hasRoutePermission = (userRole, pathname) => {
  // Find the route in protected routes
  const route = protectedRoutes.find(route => route.path === pathname);
  
  // If route not found in protected routes, it's either public or doesn't exist
  if (!route) {
    // Check if it's a public route that requires authentication
    const publicRoute = publicRoutes.find(route => route.path === pathname);
    if (publicRoute && publicRoute.requiresAuth) {
      return publicRoute.allowedRoles.includes(userRole);
    }
    return true; // Allow access to regular public routes or non-existent routes
  }
  
  // Check if user's role is allowed for this route
  return route.allowedRoles.includes(userRole);
};

// Get redirect path based on user role
export const getRedirectPathForRole = (role) => {
  switch (role) {
    case 'student':
      return '/student-profile';
    case 'teacher':
      return '/teacher-dashboard';
    case 'hod':
      return '/dashboard';
    case 'admin':
      return '/trustee-dashboard';
    case 'new':
      return '/profile-completion';
    case 'pending':
      return '/login'; // Redirect to login with pending message
    default:
      return '/';
  }
};