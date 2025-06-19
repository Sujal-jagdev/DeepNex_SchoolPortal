import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const Navbar = ({ isAuthenticated, userRole, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-menu')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  // Check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-primary shadow-md py-2' : 'bg-primary/95 py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* EduNex Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-10 w-auto" />
            <span className="logo-text text-xl font-display text-secondary">
              Edu<span className="text-bright-green">Nex</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" isActive={isActive('/')}>
              Home
            </NavLink>
            <NavLink to="/about" isActive={isActive('/about')}>
              About
            </NavLink>
            
            {isAuthenticated ? (
              <div className="relative ml-6 profile-menu">
                <button 
                  onClick={toggleProfile}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full ${isProfileOpen ? 'bg-rich-blue/20' : 'hover:bg-rich-blue/10'} transition-all duration-200`}
                >
                  <UserCircleIcon className="h-6 w-6 text-secondary" />
                  <span className="font-medium text-secondary">Profile</span>
                  <ChevronDownIcon className={`h-4 w-4 text-secondary/70 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-primary rounded-md py-2 z-10 border border-rich-blue/30 transform origin-top-right transition-all duration-200 ease-out">
                    <div className="px-4 py-2 border-b border-rich-blue/20">
                      <p className="text-sm font-medium text-secondary">Signed in as</p>
                      <p className="text-sm text-secondary/70 truncate">{userRole || 'User'}</p>
                    </div>
                    <Link 
                      to={`/dashboard/${userRole}`} 
                      className="flex items-center px-4 py-3 text-sm text-secondary hover:bg-rich-blue/20 transition-colors duration-150"
                    >
                      <svg className="w-5 h-5 mr-3 text-secondary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-accent hover:bg-accent/10 transition-colors duration-150"
                    >
                      <svg className="w-5 h-5 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center ml-6 space-x-3">
                <Link to="/login" className="btn btn-secondary border border-rich-blue/30 transition-all duration-300">
                  Login
                </Link>
                <Link to="/login" className="btn btn-green transition-all duration-300">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-rich-blue/20 transition-colors duration-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-secondary" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
        >
          <div className="flex flex-col space-y-1 pb-4">
            <MobileNavLink 
              to="/" 
              isActive={isActive('/')}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </MobileNavLink>
            <MobileNavLink 
              to="/courses" 
              isActive={isActive('/courses')}
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </MobileNavLink>
            <MobileNavLink 
              to="/about" 
              isActive={isActive('/about')}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </MobileNavLink>
            
            {isAuthenticated ? (
              <>
                <MobileNavLink 
                  to={`/dashboard/${userRole}`} 
                  isActive={isActive(`/dashboard/${userRole}`)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-accent hover:bg-accent/10 rounded-lg transition-colors duration-150"
                >
                  <svg className="w-5 h-5 mr-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 mt-4 px-2">
                <Link 
                  to="/login" 
                  className="btn btn-secondary text-center border border-rich-blue/30 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/login" 
                  className="btn btn-green text-center transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ to, children, isActive }) => (
  <Link 
    to={to} 
    className={`relative px-3 py-2 mx-1 font-medium rounded-lg transition-all duration-200 group ${isActive ? 'text-bright-green' : 'text-secondary hover:text-bright-green'}`}
  >
    {children}
    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-bright-green transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
  </Link>
);

// Mobile Navigation Link Component
const MobileNavLink = ({ to, children, isActive, onClick }) => (
  <Link 
    to={to} 
    className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${isActive ? 'bg-bright-green/20 text-bright-green' : 'text-secondary hover:bg-rich-blue/30'}`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;