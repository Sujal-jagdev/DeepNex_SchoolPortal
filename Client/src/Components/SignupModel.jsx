import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../helper/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';

const SignupModel = () => {
    const [showModel, setShowModel] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);

    // Function to check user session
    const checkSession = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error fetching session:', error);
            return;
        }
        if (data.session) {
            setIsLoggedIn(true);
            setShowModel(false);
        }
    };

    // Fetch session on mount
    useEffect(() => {
        checkSession();
    }, []);

    // Show modal every 3 seconds (unless user is logged in or on restricted pages)
    useEffect(() => {
        if (isLoggedIn || location.pathname === '/signup' || location.pathname === '/login' || location.pathname === "/dashboard" || location.pathname=== "/questioning") {
            setShowModel(false);
            return;
        }

        const timer = setInterval(() => {
            if (!isCancelled) {
                setShowModel(true);
            } else {
                setIsCancelled(false);
            }
        }, 7000); // Show modal every 7 seconds

        return () => clearInterval(timer);
    }, [isLoggedIn, location.pathname, isCancelled]);

    // Handle Register Click
    const handleRegister = () => {
        navigate('/signup');
        setShowModel(false);
    };

    // Handle Cancel Click (Hides modal for 3 seconds)
    const handleCancel = () => {
        setShowModel(false);
        setIsCancelled(true);
    };

    return (
        <AnimatePresence>
            {showModel && (
                <motion.div 
                    className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center"
                        initial={{ y: -50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -50, opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <h1 className="text-xl font-bold text-gray-800">🚀 Register now!</h1>
                        <p className="text-gray-500 mt-2">Sign up to access more features!</p>

                        <div className="mt-4 flex justify-center gap-3">
                            <motion.button 
                                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-5 rounded-md transition duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRegister}
                            >
                                Register
                            </motion.button>
                            <motion.button 
                                className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-5 rounded-md transition duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCancel}
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SignupModel;