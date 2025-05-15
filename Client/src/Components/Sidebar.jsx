import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../helper/supabaseClient';
import { FiMenu, FiX } from 'react-icons/fi';

const Sidebar = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ProfileImg, setProfileImg] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setExpanded(true); // Always expanded on desktop
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initialize
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data } = await supabase
                    .from('doctors')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                setUserRole(data?.role);
            }

            if (session?.user) {
                const { data } = await supabase
                    .from('doctors')
                    .select('avatar_url')
                    .eq('id', session.user.id)
                    .single();

                setProfileImg(data?.avatar_url);
            }

            setLoading(false);
        };

        fetchUserRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                supabase
                    .from('doctors')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => setUserRole(data?.role));
            } else {
                setUserRole(null);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className={`sticky top-16 h-[calc(100vh-4rem)] w-72 flex-shrink-0 border-r border-gray-200 bg-white p-4 shadow-sm`}>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    const navItems = [
        {
            name: "Dashboard",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
            path: "/dashboard"
        },
        {
            name: "Doctors Department",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            path: "/doctors"
        }
    ];

    if (userRole === "Trustee") {
        navItems.push({
            name: "HOD's Department",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            path: "/hods"
        });
    }

    const handleLogoClick = (e) => {
        if (isMobile) {
            // For mobile, toggle the sidebar only if clicking on the logo area (not department items)
            const isDepartmentItem = e.target.closest('.nav-item');
            if (!isDepartmentItem) {
                setExpanded(!expanded);
            }
        }
    };

    const handleNavItemClick = (path) => {
        navigate(path);
        if (isMobile) {
            setExpanded(false);
        }
    };

    return (
        <>
            {/* Toggle Button - Only visible on mobile/tablet */}
            <button
                onClick={() => setExpanded(!expanded)}
                className={`fixed top-20 ${expanded ? 'left-64' : 'left-4'} z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg transition-all duration-300 lg:hidden hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                aria-label="Toggle Sidebar"
            >
                {expanded ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Blurred overlay for mobile */}
            {isMobile && expanded && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setExpanded(false)}
                />
            )}

            <div
                className={`fixed lg:sticky top-16 h-[calc(100vh-4rem)] ${expanded ? 'left-0 w-64' : '-left-64 lg:left-0 w-64'} z-50 bg-white shadow-lg lg:shadow-none flex-shrink-0 border-r border-gray-200 p-4 transition-all duration-300 ease-in-out transform lg:translate-x-0 ${expanded ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo - Shows department name when expanded */}
                <div
                    className={`mb-10 flex items-center ${isMobile && !expanded ? 'justify-center' : ''}`}
                    onClick={handleLogoClick}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-2xl font-bold text-white">DM</div>
                    {(!isMobile || expanded) && (
                        <div className="ml-3 text-xl font-semibold text-gray-800">
                            {userRole === "HOD" ? "HOD Department" :
                                userRole === "Trustee" ? "Trustee Portal" :
                                    userRole === "Doctor" ? "Doctor Portal" : "Dashboard"}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex h-[calc(100%-12rem)] flex-col">
                    <ul className="flex-1 space-y-1 overflow-y-auto">
                        {navItems.map((item, index) => (
                            <li key={index} className="nav-item">
                                <button
                                    onClick={() => handleNavItemClick(item.path)}
                                    className={`flex w-full items-center rounded-lg px-4 py-3 text-left font-medium text-gray-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 ${isMobile && !expanded ? 'justify-center' : ''
                                        }`}
                                    title={isMobile && !expanded ? item.name : ''}
                                >
                                    <span className="opacity-70">
                                        {item.icon}
                                    </span>
                                    {(!isMobile || expanded) && (
                                        <span className="ml-3">{item.name}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* User profile and logout */}
                    <div className="mt-auto pt-4">
                        <div
                            className={`mb-4 flex items-center rounded-lg bg-gray-50 p-2 cursor-pointer hover:bg-gray-100 ${isMobile && !expanded ? 'justify-center' : ''
                                }`}
                            onClick={() => handleNavItemClick('/profile')}
                        >
                            <div className="h-10 w-10 rounded-full bg-blue-100 overflow-hidden">
                                {ProfileImg ? (
                                    <img
                                        src={ProfileImg}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=';
                                        }}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-blue-100">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-blue-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {(!isMobile || expanded) && (
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-800">
                                        {userRole === "HOD" ? "Head of Department" :
                                            userRole === "Trustee" ? "Trustee" :
                                                userRole === "Doctor" ? "Doctor" : "User"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {userRole === "HOD" ? "Administrator" :
                                            userRole === "Trustee" ? "Supervisor" :
                                                userRole === "Doctor" ? "Medical Staff" : "Guest"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-3 font-medium text-red-600 transition-all hover:bg-red-100 hover:shadow-sm
             lg:px-4 lg:py-3 lg:h-10    // Desktop
             md:px-4 md:py-3 md:h-10     // Tablet
             sm:px-3 sm:py-2.5 sm:h-12   // Small mobile (larger tap target)
             xs:px-3 xs:py-2.5 xs:h-12   // Extra small mobile
             min-w-[50px]"
                        >
                            {/* Responsive SVG icon - larger on mobile */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 lg:h-5 lg:w-5 md:h-5 md:w-5 sm:h-6 sm:w-6 xs:h-6 xs:w-6 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>

                            {/* Text that's always visible except on smallest mobile screens if needed */}
                            <span className="lg:inline md:inline sm:inline xs:hidden hidden" >Logout</span>
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;