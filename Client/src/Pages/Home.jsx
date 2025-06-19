import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FaUserGraduate,
  FaStar,
  FaChalkboardTeacher,
  FaBook,
  FaGraduationCap,
  FaArrowRight,
  FaBrain,
  FaQuestion,
  FaClipboardCheck,
  FaChartLine,
  FaMicrophone,
  FaTachometerAlt,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";
import chatGptImage from "../assets/ChatGPT Image Jun 18, 2025, 04_18_15 PM.png";

const HeroSection = () => {
  const navigate = useNavigate();

  // State for text animation
  const [teacherTextIndex, setTeacherTextIndex] = useState(0);
  const [studentTextIndex, setStudentTextIndex] = useState(0);

  const teacherTexts = [
    "Plans lessons in seconds",
    "Tells stories like a TED speaker",
    "Uses real-time examples & facts",
    "Generates quizzes instantly",
    "Adapts to every class level",
  ];

  const studentTexts = [
    "Solves doubts instantly",
    "Learns at their own pace",
    "Gets smarter with every click",
    "Prepares better for every exam",
    "Never misses a concept",
  ];

  // Text animation effect
  useEffect(() => {
    const teacherInterval = setInterval(() => {
      setTeacherTextIndex((prevIndex) => (prevIndex + 1) % teacherTexts.length);
    }, 3000);

    const studentInterval = setInterval(() => {
      setStudentTextIndex((prevIndex) => (prevIndex + 1) % studentTexts.length);
    }, 3000);

    return () => {
      clearInterval(teacherInterval);
      clearInterval(studentInterval);
    };
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden pt-16 bg-gradient-to-br from-primary via-primary/90 to-rich-blue">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/30"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [null, Math.random() * 20 - 10 + "%"],
              opacity: [null, Math.random() * 0.3 + 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto h-full flex flex-col md:flex-row items-center justify-center px-6 md:px-10 lg:px-16 py-12 md:py-20">
        {/* Left content */}
        <div className="w-full md:w-1/2 text-center md:text-left z-10 mb-10 md:mb-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="p-1 inline-block rounded-lg bg-gradient-to-r from-bright-green to-accent mb-4"
          >
            <div className="bg-primary/80 rounded-md px-4 py-1">
              <p className="text-white/90 text-sm font-medium">
                Next-Gen Education Platform
              </p>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight font-display mb-4"
          >
            AI powered{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-bright-green to-accent">
              learning management system
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-white/90 font-body mb-6"
          >
            Turn Every Teacher Into a Genius. Every Student Into a Topper.
          </motion.p>

          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/2">
                <h3 className="text-white text-base font-medium mb-2 flex items-center">
                  <FaChalkboardTeacher className="text-bright-green mr-2" /> For
                  Teachers:
                </h3>
                <div className="h-12 flex items-center bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 px-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={teacherTextIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="text-red-400 text-sm font-medium"
                    >
                      {teacherTexts[teacherTextIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div className="w-1/2">
                <h3 className="text-white text-base font-medium mb-2 flex items-center">
                  <FaUserGraduate className="text-accent mr-2" /> For Students:
                </h3>
                <div className="h-12 flex items-center bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 px-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={studentTextIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="text-red-400 text-sm font-medium"
                    >
                      {studentTexts[studentTextIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center md:justify-start"
          >
            <button
              className="bg-gradient-to-r from-bright-green to-bright-green/80 text-white py-3 px-8 rounded-md hover:shadow-lg hover:shadow-bright-green/20 transition-all duration-300 flex items-center justify-center font-medium group"
              onClick={() => navigate("/about")}
            >
              Explore Model{" "}
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-8 rounded-md hover:bg-white/15 transition-all duration-300 font-medium"
              onClick={() => navigate("/about")}
            >
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Right content - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full md:w-1/2 flex justify-center items-center z-10 px-4 sm:px-6 md:px-0"
        >
          <div className="relative w-full max-w-md mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-bright-green to-accent rounded-xl blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-primary/40 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-white/10 shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg border border-white/10 flex items-center backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group">
                  <div className="bg-gradient-to-br from-bright-green to-bright-green/70 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300">
                    <FaGraduationCap className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm sm:text-base font-medium">Learn</h3>
                    <p className="text-white/70 text-xs sm:text-sm">At your pace</p>
                  </div>
                </div>
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg border border-white/10 flex items-center backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group">
                  <div className="bg-gradient-to-br from-accent to-accent/70 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300">
                    <FaBook className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm sm:text-base font-medium">Study</h3>
                    <p className="text-white/70 text-xs sm:text-sm">Smart content</p>
                  </div>
                </div>
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg border border-white/10 flex items-center backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group">
                  <div className="bg-gradient-to-br from-bright-green to-bright-green/70 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300">
                    <FaChalkboardTeacher className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm sm:text-base font-medium">Teach</h3>
                    <p className="text-white/70 text-xs sm:text-sm">Share knowledge</p>
                  </div>
                </div>
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg border border-white/10 flex items-center backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 group">
                  <div className="bg-gradient-to-br from-accent to-accent/70 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300">
                    <FaUserGraduate className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm sm:text-base font-medium">Grow</h3>
                    <p className="text-white/70 text-xs sm:text-sm">Build skills</p>
                  </div>
                </div>
              </div>

             
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-primary to-transparent"></div>
    </section>
  );
};

const Home = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setRole(localStorage.getItem("role") || "");
    }
  }, []);

  const handleGetStarted = () => {
    if (user) {
      if (role === "student") {
        navigate("/student-dashboard");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard");
      } else {
        navigate("/courses");
      }
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-body">
      {/* Hero Section */}
      <HeroSection />

      {/* The Old Way Is Broken Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Beautiful centered title */}
          <div className="text-center mb-12">
            <motion.h2
              className="inline-block text-3xl md:text-4xl font-bold text-primary relative"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              Why This Matters
              <motion.div
                className="h-1 bg-gradient-to-r from-bright-green to-accent mt-2 rounded-full"
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "100%", opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </motion.h2>
          </div>

          <div className="flex flex-col md:flex-row items-center">
            {/* Left side: Text content */}
            <div className="w-full md:w-1/2 mb-10 md:mb-0 ps-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
                The Old Way Is Broken.
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-red-500 mr-3 mt-1">❌</div>
                  <p className="text-gray-700">
                    Teachers struggling with prep, communication, and engagement
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="text-red-500 mr-3 mt-1">❌</div>
                  <p className="text-gray-700">
                    Students bored, stuck, and unmotivated
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="text-red-500 mr-3 mt-1">❌</div>
                  <p className="text-gray-700">
                    One-size-fits-all methods in a personalized world
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-lg font-medium text-primary">
                  <span className="text-red-500">🔥</span> It's time to upgrade
                  how your school thinks
                </p>
              </div>
            </div>

            {/* Right side: ChatGPT Image with animation */}
            <div className="w-full md:w-1/2 flex justify-center">
              <motion.div
                className="relative w-full max-w-lg overflow-hidden shadow-xl rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateZ: [0, 0.8, -0.8, 0],
                }}
                transition={{
                  opacity: { duration: 1.5, ease: "easeIn" },
                  scale: { duration: 1, ease: "easeOut" },
                  rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{ scale: 1.03 }}
              >
                {/* ChatGPT Image with glow effect */}
                <motion.div className="relative w-full h-full overflow-hidden rounded-lg">
                  {/* Main image */}
                  <motion.img
                    src={chatGptImage}
                    alt="ChatGPT AI Assistant"
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                  />

                  {/* Animated glow overlay */}
                  {/* <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      background: [
                        "linear-gradient(45deg, rgba(74, 222, 128, 0) 0%, rgba(74, 222, 128, 0.1) 50%, rgba(74, 222, 128, 0) 100%)",
                        "linear-gradient(45deg, rgba(99, 102, 241, 0) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(99, 102, 241, 0) 100%)",
                        "linear-gradient(45deg, rgba(74, 222, 128, 0) 0%, rgba(74, 222, 128, 0.1) 50%, rgba(74, 222, 128, 0) 100%)",
                      ],
                      boxShadow: [
                        "0 0 20px rgba(74, 222, 128, 0.2) inset",
                        "0 0 30px rgba(99, 102, 241, 0.3) inset",
                        "0 0 20px rgba(74, 222, 128, 0.2) inset",
                      ]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  /> */}

                  {/* Pulsing border effect */}
                  {/* <motion.div
                    className="absolute inset-0 border-2 border-transparent rounded-lg pointer-events-none"
                    animate={{
                      borderColor: [
                        "rgba(74, 222, 128, 0.3)",
                        "rgba(99, 102, 241, 0.3)",
                        "rgba(74, 222, 128, 0.3)"
                      ],
                      boxShadow: [
                        "0 0 10px rgba(74, 222, 128, 0.3)",
                        "0 0 15px rgba(99, 102, 241, 0.4)",
                        "0 0 10px rgba(74, 222, 128, 0.3)"
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  /> */}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Your AI Co-Teachers & Student Assistants Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
              Meet Your{" "}
              <span className="text-bright-green">AI Co-Teachers</span> &
              <span className="text-bright-green">Student Assistants</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful AI support for both educators and learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Teachers */}
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex justify-center mb-6 space-x-4">
                <motion.div
                  className="bg-primary/10 p-3 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <FaBook className="text-primary text-2xl" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-bright-green rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-primary/10 p-3 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="relative">
                    <FaChalkboardTeacher className="text-primary text-2xl" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-bright-green rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <h3 className="text-xl font-bold mb-4 text-primary text-center">
                For Teachers
              </h3>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-bright-green/10 p-1 rounded-full mr-3 mt-1">
                    <div className="w-3 h-3 bg-bright-green rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    AI-generated lesson plans, examples, and storytelling
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="bg-bright-green/10 p-1 rounded-full mr-3 mt-1">
                    <div className="w-3 h-3 bg-bright-green rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    Ready-to-use quizzes and activities
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="bg-bright-green/10 p-1 rounded-full mr-3 mt-1">
                    <div className="w-3 h-3 bg-bright-green rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    Boost confidence, clarity, and delivery
                  </p>
                </li>
              </ul>
            </div>

            {/* For Students */}
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="flex justify-center mb-6 space-x-4">
                <motion.div
                  className="bg-primary/10 p-3 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <div className="text-primary text-2xl">💬</div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-primary/10 p-3 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="relative">
                    <FaUserGraduate className="text-primary text-2xl" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <h3 className="text-xl font-bold mb-4 text-primary text-center">
                For Students
              </h3>

              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-accent/10 p-1 rounded-full mr-3 mt-1">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                  </div>
                  <p className="text-gray-700">
                    Ask doubts, get instant answers
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="bg-accent/10 p-1 rounded-full mr-3 mt-1">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Personalized learning quizzes</p>
                </li>
                <li className="flex items-start">
                  <div className="bg-accent/10 p-1 rounded-full mr-3 mt-1">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                  </div>
                  <p className="text-gray-700">Never study alone again</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Magic Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
              ✨ How It <span className="text-bright-green">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to transform your educational experience
            </p>
          </div>

          <div className="relative">
            {/* Steps */}
            <div className="relative z-0 max-w-2xl mx-auto">
              {/* Connector Line */}
              <div className="absolute left-8 top-8 bottom-8 w-1 bg-gray-200 hidden md:block"></div>

              {/* Step 1 */}
              <motion.div
                className="flex flex-col md:flex-row mb-8 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="md:w-16 mb-4 md:mb-0 flex justify-center">
                  <div className="w-12 h-12 bg-bright-green rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    1
                  </div>
                </div>
                <div className="flex-1 md:pl-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-primary">
                      Choose your Class & Subject
                    </h3>
                    <p className="text-gray-600">
                      Select the grade level and subject you want to teach or
                      learn.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="flex flex-col md:flex-row mb-8 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="md:w-16 mb-4 md:mb-0 flex justify-center">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    2
                  </div>
                </div>
                <div className="flex-1 md:pl-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-primary">
                      Let AI plan the topic
                    </h3>
                    <p className="text-gray-600">
                      Our AI generates complete lesson plans with scripts,
                      storytelling & quizzes.
                    </p>
                    <motion.div
                      className="mt-3 text-bright-green"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-sm">✨ Magic happens here</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="flex flex-col md:flex-row relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="md:w-16 mb-4 md:mb-0 flex justify-center">
                  <div className="w-12 h-12 bg-bright-green rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                    3
                  </div>
                </div>
                <div className="flex-1 md:pl-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-primary">
                      Students get personalized support
                    </h3>
                    <p className="text-gray-600">
                      AI continues to help students after class with
                      personalized assistance.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg font-medium text-primary">
              🎬 It's like having 100 expert tutors in your staff room — 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-4 md:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-3 text-primary"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              Core <span className="text-bright-green">Features</span>
              <motion.div
                className="h-1 bg-gradient-to-r from-bright-green to-accent mt-2 rounded-full w-24 mx-auto"
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "6rem", opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </motion.h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to transform education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start mb-4">
                <motion.div
                  className="bg-gradient-to-br from-bright-green to-bright-green/70 p-3 rounded-full mr-3"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    rotate: [0, 5, -5, 0],
                    boxShadow: [
                      "0 0 0 rgba(74, 222, 128, 0)",
                      "0 0 20px rgba(74, 222, 128, 0.5)",
                      "0 0 0 rgba(74, 222, 128, 0)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaBrain className="text-white text-xl" />
                </motion.div>
                <h3 className="text-lg font-bold text-primary pt-1">
                  AI Lesson Planning
                </h3>
              </div>
              <p className="text-gray-600 ml-12">
                With storytelling, tone & examples tailored to your classroom
                needs
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-start mb-4">
                <div
                  className="bg-gradient-to-br from-accent to-accent/70 p-3 rounded-full mr-3"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    y: [0, -5, 0],
                    boxShadow: [
                      "0 0 0 rgba(99, 102, 241, 0)",
                      "0 0 20px rgba(99, 102, 241, 0.5)",
                      "0 0 0 rgba(99, 102, 241, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaQuestion className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-bold text-primary pt-1">
                  Real-time Doubt Solver
                </h3>
              </div>
              <p className="text-gray-600 ml-12">
                For students to get instant help whenever they need it
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-start mb-4">
                <motion.div
                  className="bg-gradient-to-br from-bright-green to-bright-green/70 p-3 rounded-full mr-3"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 0 rgba(74, 222, 128, 0)",
                      "0 0 20px rgba(74, 222, 128, 0.5)",
                      "0 0 0 rgba(74, 222, 128, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaClipboardCheck className="text-white text-xl" />
                </motion.div>
                <h3 className="text-lg font-bold text-primary pt-1">
                  Smart Quiz Engine
                </h3>
              </div>
              <p className="text-gray-600 ml-12">
                Adaptive & customizable assessments that grow with your students
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-start mb-4">
                <motion.div
                  className="bg-gradient-to-br from-accent to-accent/70 p-3 rounded-full mr-3"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    rotate: [0, 10, 0],
                    boxShadow: [
                      "0 0 0 rgba(99, 102, 241, 0)",
                      "0 0 20px rgba(99, 102, 241, 0.5)",
                      "0 0 0 rgba(99, 102, 241, 0)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaChartLine className="text-white text-xl" />
                </motion.div>
                <h3 className="text-lg font-bold text-primary pt-1">
                  AI Performance Reports
                </h3>
              </div>
              <p className="text-gray-600 ml-12">
                Detailed insights for individual students and entire classes
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-start mb-4">
                <motion.div
                  className="bg-gradient-to-br from-bright-green to-bright-green/70 p-3 rounded-full mr-3"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.8, 1],
                    boxShadow: [
                      "0 0 0 rgba(74, 222, 128, 0)",
                      "0 0 20px rgba(74, 222, 128, 0.5)",
                      "0 0 0 rgba(74, 222, 128, 0)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaMicrophone className="text-white text-xl" />
                </motion.div>
                <h3 className="text-lg font-bold text-primary pt-1">
                  Voice-Based Assistant
                </h3>
              </div>
              <p className="text-gray-600 ml-12">
                With multilingual support for diverse classrooms
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-start mb-4">
                <motion.div
                  className="bg-gradient-to-br from-accent to-accent/70 p-3 rounded-full mr-3"
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    rotate: [0, -5, 5, 0],
                    boxShadow: [
                      "0 0 0 rgba(99, 102, 241, 0)",
                      "0 0 20px rgba(99, 102, 241, 0.5)",
                      "0 0 0 rgba(99, 102, 241, 0)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaTachometerAlt className="text-white text-xl" />
                </motion.div>
                <h3 className="text-lg font-bold text-primary pt-1">
                  Admin Dashboard
                </h3>
              </div>
              <p className="text-gray-600 ml-12">
                Track learning outcomes in real-time across your institution
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
              Student <span className="text-bright-green">Testimonials</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What our community has to say about their learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex text-yellow-500 mb-4">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
              <p className="text-gray-600 text-sm mb-6">
                "The personalized learning approach has transformed my academic
                performance. I'm more engaged and confident than ever before."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
             
                </div>
                <div>
                  
                  <p className="text-gray-500 text-xs">Student</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex text-yellow-500 mb-4">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
              </div>
              <p className="text-gray-600 text-sm mb-6">
                "As a parent, I've seen remarkable improvement in my son's
                grades and interest in learning. The teachers are exceptional
                and truly care."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
          
                </div>
                <div>
                  
                  <p className="text-gray-500 text-xs">Parent</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex text-yellow-500 mb-4">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar className="text-gray-300" />
              </div>
              <p className="text-gray-600 text-sm mb-6">
                "The interactive lessons and real-world applications have made
                teaching more effective. Students are more engaged and show
                better results."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">

                </div>
                <div>
                 
                  <p className="text-gray-500 text-xs">Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 md:w-2/3">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
                Build Your <span className="text-bright-green">AI School</span>{" "}
                Today
              </h2>
              <p className="text-gray-600 mb-6 max-w-lg">
                Ready to Supercharge Your School? <br />
                Let us show you how your teachers and students can be 10x more
                effective — in just 7 days.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-bright-green text-white rounded-md hover:bg-bright-green/90 transition-colors duration-300 text-sm font-medium"
                >
                  Get Started
                </button>
                <button className="px-6 py-2 bg-white text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors duration-300 font-medium">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden md:block md:w-1/3 bg-gradient-to-br from-primary/20 via-bright-green/20 to-blue-400/20 h-full p-8 rounded-r-lg shadow-inner">
              <div className="flex items-center justify-center h-full">
                <motion.div
                  className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-bright-green/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <motion.div
                    className="bg-gradient-to-br from-primary to-bright-green rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-md mb-4"
                    whileHover={{ rotate: 5 }}
                  >
                    <FaGraduationCap className="text-3xl text-white" />
                  </motion.div>
                  <h3 className="text-primary font-bold text-xl mb-3">
                    Contact Us
                  </h3>
                  <div className="space-y-3">
                    <motion.a
                      href="mailto:info@deepnex.in"
                      className="flex items-center justify-center gap-2 text-gray-700 hover:text-bright-green transition-colors duration-300"
                      whileHover={{ x: 3 }}
                    >
                      <FaEnvelope className="text-bright-green" />{" "}
                      info@deepnex.in
                    </motion.a>
                    <motion.a
                      href="tel:+919876543210"
                      className="flex items-center justify-center gap-2 text-gray-700 hover:text-bright-green transition-colors duration-300"
                      whileHover={{ x: 3 }}
                    >
                      <FaPhone className="text-bright-green" /> +91 6355338791
                    </motion.a>
                    <motion.a
                      className="flex items-center justify-center 
                      text-gray-700 hover:text-bright-green transition-colors duration-300"
                      whileHover={{ x: 3 }} 
                    >
                      <FaMapMarkerAlt className="text-bright-green mb-7 ml-5" /> 31 M2, Madhuram Circle, Dindoli, Surat, Gujarat
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
