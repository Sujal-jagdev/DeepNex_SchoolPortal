import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, userRole, onLogout }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userRole={userRole} onLogout={onLogout} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;