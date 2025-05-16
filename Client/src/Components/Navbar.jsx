import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHome,
  FiBook,
  FiUsers,
  FiInfo,
  FiMessageSquare,
  FiCalendar,
  FiAward,
  FiSettings,
  FiActivity,
  FiBarChart2,
  FiClipboard,
  FiBookOpen,
  FiMessageCircle,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { supabase } from "../helper/supabaseClient";
import Logo from "../assets/logo.png";
import { MyContext } from "../AllContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImg, setProfileImg] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { role: userRole } = useContext(MyContext);
  const [isApproved, setIsApproved] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Scroll animations
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0.97)", "rgba(255, 255, 255, 0.99)"]
  );
  const shadow = useTransform(
    scrollY,
    [0, 100],
    ["0 1px 3px rgba(0, 0, 0, 0.03)", "0 4px 12px rgba(0, 0, 0, 0.08)"]
  );

  useEffect(() => {
    // In the Navbar component, update the fetchUserData function
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // Check each possible user table to find the user's role
          const tables = ['admin', 'teacher', 'hod', 'student'];
          let userData = null;
          let userRole = null;
          let isApproved = false;

          for (const table of tables) {
            const { data, error } = await supabase
              .from(table)
              .select("*, avatar_url")
              .eq("id", session.user.id)
              .single();

            if (data && !error) {
              userData = { ...data, role: table };
              userRole = table;

              // Special check for teachers
              if (table === 'teacher') {
                // Check if teacher is approved
                const { data: approvalData } = await supabase
                  .from('teacher_approvals')
                  .select('status')
                  .eq('teacher_email', session.user.email)
                  .single();

                isApproved = approvalData?.status === 'approved';
              } else {
                // For non-teachers, consider them approved
                isApproved = true;
              }
              break;
            }
          }

          setRole(userRole);
          setProfileImg(userData?.avatar_url || null);
          setUnreadNotifications(userData?.unread_notifications || 0);

          // Store approval status in state or context
          setIsApproved(isApproved);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);

        // Check each possible user table to find the user's role
        const checkUserTables = async () => {
          const tables = ['admin', 'teacher', 'hod', 'student'];
          let userData = null;

          for (const table of tables) {
            const { data, error } = await supabase
              .from(table)
              .select("*, avatar_url")
              .eq("id", session.user.id)
              .single();

            if (data && !error) {
              userData = { ...data, role: table };
              break;
            }
          }

          setRole(userData?.role || null);
          setProfileImg(userData?.avatar_url || null);
          setUnreadNotifications(userData?.unread_notifications || 0);
        };

        checkUserTables();
      } else {
        setUser(null);
        setRole(null);
        setProfileImg(null);
        setUnreadNotifications(0);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isAdmin = role === "admin";
  const isHOD = role === "hod";
  const isTeacher = role === "teacher" && isApproved; // Only approved teachers
  const isStudent = role === "student";

  // Role-specific dropdown items
  const getRoleDropdownItems = () => {
    if (isAdmin) {
      return [
        {
          to: "/admin/dashboard",
          icon: <FiActivity className="text-indigo-500" />,
          text: "Admin Dashboard",
          description: "Manage school administration",
        },
        {
          to: "/admin/reports",
          icon: <FiBarChart2 className="text-blue-500" />,
          text: "Reports",
          description: "View system analytics",
        },
        {
          to: "/admin/settings",
          icon: <FiSettings className="text-gray-500" />,
          text: "Settings",
          description: "Configure system settings",
        },
      ];
    }

    if (isHOD) {
      return [
        {
          to: "/hod/dashboard",
          icon: <FiActivity className="text-indigo-500" />,
          text: "HOD Dashboard",
          description: "Department overview",
        },
        {
          to: "/hod/reports",
          icon: <FiBarChart2 className="text-blue-500" />,
          text: "Department Reports",
          description: "View department analytics",
        },
      ];
    }

    if (isTeacher) {
      if (isApproved) {
        return [
          {
            to: "/teacher/dashboard",
            icon: <FiActivity className="text-indigo-500" />,
            text: "Teacher Dashboard",
            description: "Your teaching overview",
          },
          {
            to: "/teacher/classes",
            icon: <FiBookOpen className="text-green-500" />,
            text: "My Classes",
            description: "Manage your classes",
          },
          {
            to: "/teacher/attendance",
            icon: <FiClipboard className="text-orange-500" />,
            text: "Attendance",
            description: "Take student attendance",
          },
        ];
      } else {
        return [
          {
            to: "/pending-approval",
            icon: <FiClock className="text-yellow-500" />,
            text: "Pending Approval",
            description: "Waiting for admin/HOD approval",
          }
        ];
      }
    }

    return [];
  };

  return (
    <motion.nav
      style={{
        backgroundColor,
        boxShadow: shadow,
      }}
      className="fixed w-full z-50 backdrop-blur-sm transition-all duration-300 border-b border-gray-100 py-2"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 group"
              aria-label="Home"
            >
              <motion.div
                className="relative"
                whileHover={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.7 }}
              >
                <motion.img
                  src={Logo}
                  alt="School Logo"
                  className="w-9 h-9"
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                />
              </motion.div>
              <motion.span
                className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                School Portal
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex items-center space-x-1">
              <NavLink
                to="/"
                icon={<FiHome />}
                text="Home"
                isActive={location.pathname === "/"}
              />
              <NavLink
                to="/courses"
                icon={<FiBook />}
                text="Courses"
                isActive={location.pathname.startsWith("/courses")}
              />

              {(isAdmin || isHOD || isTeacher) && (
                <NavLink
                  to="/students"
                  icon={<FiUsers />}
                  text="Students"
                  isActive={location.pathname.startsWith("/students")}
                />
              )}

              {(isAdmin || isHOD) && (
                <NavLink
                  to="/staff"
                  icon={<FiAward />}
                  text="Staff"
                  isActive={location.pathname.startsWith("/staff")}
                />
              )}

              {
                role == "student" ? <NavLink
                  to="/studentchat"
                  icon={<FiMessageCircle />}
                  text="StudentChat"
                  isActive={location.pathname.startsWith("/studentchat")}
                /> : ""
              }

              {
                role == "teacher" ? <NavLink
                  to="/teacherchat"
                  icon={<FiMessageCircle />}
                  text="TeacherChat"
                  isActive={location.pathname.startsWith("/teacherchat")}
                /> : ""
              }

              <NavLink
                to="/about"
                icon={<FiInfo />}
                text="About"
                isActive={location.pathname.startsWith("/about")}
              />

              {(isTeacher || isStudent) && (
                <NavLink
                  to="/messages"
                  icon={<FiMessageSquare />}
                  text="Messages"
                  isActive={location.pathname.startsWith("/messages")}
                  badge={unreadNotifications > 0 ? unreadNotifications : null}
                />
              )}
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications (Desktop) */}
                {(isTeacher || isStudent) && (
                  <motion.div
                    className="hidden md:block relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/notifications"
                      className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-300 relative"
                      aria-label="Notifications"
                    >
                      <FiBell className="w-5 h-5" />
                      {unreadNotifications > 0 && (
                        <motion.span
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          {unreadNotifications > 9 ? "9+" : unreadNotifications}
                        </motion.span>
                      )}
                    </Link>
                  </motion.div>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <motion.button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="User profile"
                    aria-expanded={isProfileOpen}
                  >
                    <div className="relative">
                      <motion.div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      <motion.img
                        src={
                          profileImg ||
                          "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                        }
                        alt="Profile"
                        className="w-9 h-9 rounded-full border-2 border-transparent group-hover:border-indigo-200 transition-all duration-300 object-cover"
                        whileTap={{ scale: 0.9 }}
                      />
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors duration-300 truncate max-w-[120px]">
                        {user.user_metadata?.full_name ||
                          user.email?.split("@")[0] ||
                          "User"}
                      </span>
                      {role && (
                        <span className="text-xs text-gray-500 group-hover:text-indigo-400">
                          {role}
                        </span>
                      )}
                    </div>
                    <FiChevronDown
                      className={`hidden md:block text-gray-400 transition-transform duration-200 ${isProfileOpen ? "transform rotate-180" : ""}`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          damping: 20,
                          stiffness: 300,
                        }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 origin-top-right z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                profileImg ||
                                "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                              }
                              alt="Profile"
                              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">
                                {user.user_metadata?.full_name || "User"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {role && (
                            <motion.p
                              className="text-xs mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full inline-block font-semibold"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {role}
                            </motion.p>
                          )}
                        </div>
                        <div className="py-1">
                          {/* Role-specific links */}
                          {getRoleDropdownItems().map((item, index) => (
                            <DropdownLink
                              key={index}
                              to={item.to}
                              icon={item.icon}
                              text={item.text}
                              description={item.description}
                              onClick={() => setIsProfileOpen(false)}
                            />
                          ))}

                          {/* Common Links */}
                          {
                            role == "student" ? <DropdownLink
                              to={`/student-profile`}
                              icon={<FiUser className="text-purple-500" />}
                              text="My Profile"
                              description="View and edit your profile"
                              onClick={() => setIsProfileOpen(false)}
                            /> : role === "teacher" && !isApproved ? <DropdownLink
                              to="/login"
                              icon={<FiClock className="text-yellow-500" />}
                              text="Pending Approval"
                              description="Waiting for admin/HOD approval"
                              onClick={() => setIsProfileOpen(false)} />
                              : role === "teacher" ?
                                <DropdownLink
                                  to="/teacher-profile"
                                  icon={<FiUser className="text-purple-500" />}
                                  text="My Profile"
                                  description="View and edit your profile"
                                  onClick={() => setIsProfileOpen(false)} /> :
                                role == "hod" ? <DropdownLink
                                  to={`/hod-profile`}
                                  icon={<FiUser className="text-purple-500" />}
                                  text="My Profile"
                                  description="View and edit your profile"
                                  onClick={() => setIsProfileOpen(false)}
                                /> : role == "admin" ? "" : null
                          }

                          {
                            role == "student" ? "" : <DropdownLink
                              to="/dashboard"
                              icon={<FiUser className="text-purple-500" />}
                              text="Dashboard"
                              description="View and edit your profile"
                              onClick={() => setIsProfileOpen(false)}
                            />
                          }

                          <motion.button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm text-red-500 hover:bg-gray-50 transition-colors duration-200 border-t border-gray-100"
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiLogOut className="mr-3" />
                            <div className="text-left">
                              <p className="font-medium">Logout</p>
                              <p className="text-xs text-gray-400">Sign out of your account</p>
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                  aria-label="Login"
                >
                  Login
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signup"
                    className="hidden md:block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label="Sign Up"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-600 p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none transition-colors duration-300 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              {user && unreadNotifications > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98],
              }}
              className="md:hidden overflow-hidden bg-white rounded-xl shadow-lg mt-2 border border-gray-100"
            >
              <div className="flex flex-col space-y-1 px-2 py-3">
                <MobileNavLink to="/" icon={<FiHome />} text="Home" />
                <MobileNavLink to="/courses" icon={<FiBook />} text="Courses" />
                <MobileNavLink to="/events" icon={<FiCalendar />} text="Events" />

                {user && role === "student" && (
                  <MobileNavLink
                    to="/studentchat"
                    icon={<FiMessageCircle />}
                    text="StudentChat"
                  />
                )}

                {user && role === "teacher" && (
                  <MobileNavLink
                    to="/teacherchat"
                    icon={<FiMessageCircle />}
                    text="TeacherChat"
                  />
                )}

                {(isAdmin || isHOD || isTeacher) && (
                  <MobileNavLink to="/students" icon={<FiUsers />} text="Students" />
                )}

                {(isAdmin || isHOD) && (
                  <MobileNavLink to="/staff" icon={<FiAward />} text="Staff" />
                )}

                <MobileNavLink to="/about" icon={<FiInfo />} text="About" />

                {!user ? (
                  <>
                    <MobileNavLink to="/login" icon={<FiUser />} text="Login" />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MobileNavLink
                        to="/signup"
                        icon={<FiUser />}
                        text="Sign Up"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:text-white hover:from-indigo-700 hover:to-purple-700"
                      />
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Notifications in mobile */}
                    {(isTeacher || isStudent) && (
                      <MobileNavLink
                        to="/notifications"
                        icon={<FiBell />}
                        text="Notifications"
                        badge={unreadNotifications > 0 ? unreadNotifications : null}
                      />
                    )}

                    {/* Role-specific mobile links */}
                    {getRoleDropdownItems().map((item, index) => (
                      <MobileNavLink
                        key={index}
                        to={item.to}
                        icon={item.icon}
                        text={item.text}
                      />
                    ))}

                    <MobileNavLink to="/profile" icon={<FiUser />} text="My Profile" />

                    <motion.button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 text-base font-medium text-red-500 hover:bg-gray-50 rounded-lg transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <FiLogOut className="mr-3" />
                      Logout
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// Reusable components
const NavLink = ({ to, icon, text, isActive, badge }) => (
  <Link
    to={to}
    className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${isActive
      ? "text-indigo-600 bg-indigo-50/80"
      : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50"
      }`}
    aria-current={isActive ? "page" : undefined}
  >
    <motion.span
      className={`mr-2 transition-colors duration-300 ${isActive ? "text-indigo-500" : "text-gray-500 group-hover:text-indigo-500"
        }`}
      whileHover={{ rotate: 10 }}
    >
      {icon}
    </motion.span>
    {text}
    {badge && (
      <motion.span
        className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
      >
        {badge > 9 ? "9+" : badge}
      </motion.span>
    )}
    <motion.span
      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-0.5 ${isActive ? "opacity-100" : "opacity-0"
        } bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full`}
      initial={{ width: isActive ? "80%" : 0 }}
      whileHover={{ width: "80%", opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
  </Link>
);

const MobileNavLink = ({ to, icon, text, onClick, badge, className = "" }) => (
  <motion.div
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400 }}
  >
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors duration-300 ${className} ${className.includes("bg-gradient")
        ? ""
        : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <motion.span
          className="mr-3 text-gray-500"
          whileHover={{ scale: 1.1 }}
        >
          {icon}
        </motion.span>
        {text}
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  </motion.div>
);

const DropdownLink = ({ to, icon, text, description, onClick }) => (
  <motion.div
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400 }}
  >
    <Link
      to={to}
      className="flex items-start px-4 py-3 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
      onClick={onClick}
    >
      <motion.span className="mr-3 mt-0.5" whileHover={{ rotate: 10 }}>
        {icon}
      </motion.span>
      <div>
        <p className="font-medium">{text}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </Link>
  </motion.div>
);

export default Navbar;