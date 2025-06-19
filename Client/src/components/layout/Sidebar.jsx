import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
const Sidebar = ({ userRole, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Define navigation items based on user role
  const getNavItems = () => {
    // Common items for all roles
    const commonItems = [
      {
        name: 'Dashboard',
        icon: <HomeIcon className="w-6 h-6" />,
        path: `/dashboard/${userRole}`,
      },
      
    ];
    // For teacher role, show Lesson Planning and Student Analytics points
    if (userRole === 'teacher') {
      return [
        ...commonItems,
        {
          name: 'Lesson Planning',
          icon: <AcademicCapIcon className="w-6 h-6" />,
          path: `/dashboard/${userRole}/lesson-planning`,
        },
        {
          name: 'Analytics',
          icon: <ChartBarIcon className="w-6 h-6" />,
          path: `/dashboard/${userRole}/student-analytics`,
        },
        {
          name: 'Profile',
          icon: <UserCircleIcon className="w-6 h-6" />,
          path: `/dashboard/${userRole}/profile`,
        },
        {
          name: 'AI Assistant',
          icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
          path: `/dashboard/${userRole}/ai-assistant`,
        }
      ];
    }

    // For other roles, show role-specific items
    const roleSpecificItems = {
      student: [
        {
          name: 'Courses',
          icon: <AcademicCapIcon className="w-6 h-6" />,
          path: '/courses',
        },
        {
          name: 'AI Assistant',
          icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
          path: `/dashboard/${userRole}/ai-assistant`,
        },
        {
          name: 'Profile',
          icon: <UserCircleIcon className="w-6 h-6" />,
          path: `/dashboard/${userRole}/profile`,
        },
      ],
      hod: [
        {
          name: 'Analytics',
          icon: <ChartBarIcon className="w-6 h-6" />,
          path: '/dashboard/hod/analytics',
        },
        {
          name: 'Teachers',
          icon: <UserGroupIcon className="w-6 h-6" />,
          path: '/dashboard/hod/teachers',
        },
        {
          name: 'Profile',
          icon: <UserCircleIcon className="w-6 h-6" />,
          path: `/dashboard/${userRole}/profile`,
        },
      ],
      admin: [
        {
          name: 'Users',
          icon: <UserGroupIcon className="w-6 h-6" />,
          path: '/dashboard/admin/users',
        },
        {
          name: 'Analytics',
          icon: <ChartBarIcon className="w-6 h-6" />,
          path: '/dashboard/admin/analytics',
        },
        // {
        //   name: 'Settings',
        //   icon: <Cog6ToothIcon className="w-6 h-6" />,
        //   path: '/dashboard/admin/settings',
        // },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[userRole] || [])];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-primary text-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div
        className={`bg-white shadow-md h-screen flex flex-col transition-all duration-300 fixed md:relative z-10
          ${isCollapsed && !isMobile ? 'w-20' : 'w-64'} 
          ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}
      >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed ? (
          <Link to="/" className="flex items-center space-x-2">
            <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-8 w-auto" />
            <span className="text-xl font-display text-primary">
              Edu<span className="text-bright-green">Nex</span>
            </span>
          </Link>
        ) : (
          <Link to="/" className="flex justify-center">
            <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-8 w-auto" />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg
            className={`w-6 h-6 text-gray-600 transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isCollapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
            />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <div className="py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path &&
              (!item.state?.activeTab ||
                (location.state?.activeTab === item.state?.activeTab));
            return (
              <Link
                key={item.name}
                to={{
                  pathname: item.path,
                  state: item.state
                }}
                className={`flex items-center px-4 py-3 ${isActive ? 'bg-primary bg-opacity-10 text-primary border-r-4 border-primary' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="flex items-center">
                  {item.icon}
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="w-full p-4 border-t mt-auto">
        <button
          onClick={onLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 w-full text-gray-700 hover:bg-gray-100 rounded-md`}
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
      
      {/* Overlay when mobile menu is open */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;