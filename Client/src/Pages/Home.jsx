import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft, FaBook, FaChalkboardTeacher, FaSchool, FaCalendarAlt, FaStar, FaGraduationCap, FaUserGraduate, FaLaptop } from 'react-icons/fa';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../helper/supabaseClient';
import { 
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft 
} from 'react-icons/fa';

const HeroSlider = ({ darkMode }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1800&q=80",
      title: "Excellence in Education",
      subtitle: "Nurturing young minds for a brighter future",
      cta: "Explore Our Programs",
      textPosition: "left"
    },
    {
      image: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=1800&q=80",
      title: "Modern Learning Environment",
      subtitle: "State-of-the-art facilities for 21st century learning",
      cta: "Take a Virtual Tour",
      textPosition: "right"
    },
    {
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1800&q=80",
      title: "Dedicated Educators",
      subtitle: "Passionate teachers inspiring lifelong learning",
      cta: "Meet Our Faculty",
      textPosition: "center"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        nextSlide();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    exit: { opacity: 0, y: -50 }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 1.2, ease: "easeOut" }
    },
    exit: { opacity: 0, scale: 0.9 }
  };

  const getTextAlignment = (position) => {
    switch(position) {
      case 'left': return 'items-start text-left';
      case 'right': return 'items-end text-right';
      case 'center': return 'items-center text-center';
      default: return 'items-start text-left';
    }
  };

  return (
    <section 
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider navigation arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      >
        <FaChevronLeft className="text-xl" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      >
        <FaChevronRight className="text-xl" />
      </button>

      {/* Slide indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={imageVariants}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </motion.div>

        {/* Text content */}
        <motion.div
          key={`text-${currentSlide}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={textVariants}
          className={`absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10 ${getTextAlignment(slides[currentSlide].textPosition)}`}
        >
          <div className="max-w-2xl space-y-6">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              transition={{ delay: 0.2 }}
            >
              {slides[currentSlide].title}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-white/90"
              transition={{ delay: 0.4 }}
            >
              {slides[currentSlide].subtitle}
            </motion.p>
            <motion.div
              transition={{ delay: 0.6 }}
            >
              <button 
                className="mt-8 bg-white hover:bg-gray-100 text-indigo-700 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                onClick={() => navigate('/programs')}
              >
                {slides[currentSlide].cta} <FaArrowRight className="ml-2" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Overlay gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent z-0"></div>
    </section>
  );
};

const Home = ({ darkMode }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Animation controls for each section
  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();
  const controls4 = useAnimation();
  const controls5 = useAnimation();
  const controls6 = useAnimation();

  // Intersection observers for each section
  const [ref1, inView1] = useInView({ threshold: 0.1, triggerOnce: false });
  const [ref2, inView2] = useInView({ threshold: 0.1, triggerOnce: false });
  const [ref3, inView3] = useInView({ threshold: 0.1, triggerOnce: false });
  const [ref4, inView4] = useInView({ threshold: 0.1, triggerOnce: false });
  const [ref5, inView5] = useInView({ threshold: 0.1, triggerOnce: false });
  const [ref6, inView6] = useInView({ threshold: 0.1, triggerOnce: false });

  // Trigger animations when sections come into view
  useEffect(() => {
    if (inView1) controls1.start("visible");
    else controls1.start("hidden");
  }, [controls1, inView1]);

  useEffect(() => {
    if (inView2) controls2.start("visible");
    else controls2.start("hidden");
  }, [controls2, inView2]);

  useEffect(() => {
    if (inView3) controls3.start("visible");
    else controls3.start("hidden");
  }, [controls3, inView3]);

  useEffect(() => {
    if (inView4) controls4.start("visible");
    else controls4.start("hidden");
  }, [controls4, inView4]);

  useEffect(() => {
    if (inView5) controls5.start("visible");
    else controls5.start("hidden");
  }, [controls5, inView5]);

  useEffect(() => {
    if (inView6) controls6.start("visible");
    else controls6.start("hidden");
  }, [controls6, inView6]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // Check each possible user table to find the user's role
        const tables = ['admin', 'teacher', 'hod', 'student'];
        let userData = null;
        
        for (const table of tables) {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data && !error) {
            userData = { ...data, role: table };
            break;
          }
        }

        setRole(userData?.role || null);
      }
    };

    fetchUserData();
  }, []);

  const teachers = [
    {
      id: 1,
      name: "Sarah Johnson",
      subject: "Mathematics",
      experience: "12 years",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4.9
    },
    {
      id: 2,
      name: "Michael Chen",
      subject: "Science",
      experience: "8 years",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4.8
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      subject: "English Literature",
      experience: "15 years",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 5.0
    },
    {
      id: 4,
      name: "David Wilson",
      subject: "History",
      experience: "10 years",
      image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      rating: 4.7
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === teachers.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? teachers.length - 1 : prev - 1));
  };

  const handleGetStarted = () => {
    if (!user) {
      navigate('/login');
    } else if (role === 'Teacher') {
      navigate('/profile');
    } else if (role === 'Admin') {
      navigate('/dashboard');
    } else if (role === 'Student') {
      navigate('/student-dashboard');
    } else if (role === 'Parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/profile');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        nextSlide();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInDown = {
    hidden: { opacity: 0, y: -40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 overflow-x-hidden">
      {/* Hero Slider Section */}
      <HeroSlider darkMode={darkMode} />

      {/* Stats Section */}
      <section ref={ref1} className="py-16 px-4 md:px-8 bg-white -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate={controls1}
            variants={container}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              { icon: <FaChalkboardTeacher className="text-3xl" />, number: "85+", text: "Expert Teachers", color: "bg-indigo-100 text-indigo-600" },
              { icon: <FaUserGraduate className="text-3xl" />, number: "2.5K+", text: "Students Enrolled", color: "bg-purple-100 text-purple-600" },
              { icon: <FaBook className="text-3xl" />, number: "30+", text: "Courses Offered", color: "bg-blue-100 text-blue-600" },
              { icon: <FaGraduationCap className="text-3xl" />, number: "100%", text: "Success Rate", color: "bg-teal-100 text-teal-600" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={item}
                className={`p-6 rounded-2xl ${stat.color} flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-bold mb-2">{stat.number}</h3>
                <p className="text-gray-700 font-medium">{stat.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={ref2} className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial="hidden"
            animate={controls2}
            variants={fadeInDown}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Powerful <span className="text-indigo-600">Features</span>
          </motion.h2>
          <motion.p 
            initial="hidden"
            animate={controls2}
            variants={fadeInDown}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Everything you need to manage your educational institution effectively
          </motion.p>
        </div>
        
        <motion.div 
          initial="hidden"
          animate={controls2}
          variants={container}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <FaChalkboardTeacher className="text-2xl text-indigo-600" />,
              title: "Teacher Portal",
              description: "Comprehensive tools for lesson planning, grading, and student progress tracking.",
              color: "from-indigo-400 to-indigo-600"
            },
            {
              icon: <FaUserGraduate className="text-2xl text-purple-600" />,
              title: "Student Dashboard",
              description: "Personalized learning space with assignments, grades, and resources.",
              color: "from-purple-400 to-purple-600"
            },
            {
              icon: <FaLaptop className="text-2xl text-blue-600" />,
              title: "Online Learning",
              description: "Virtual classrooms and digital resources for blended learning.",
              color: "from-blue-400 to-blue-600"
            },
            {
              icon: <FaCalendarAlt className="text-2xl text-teal-600" />,
              title: "Attendance System",
              description: "Automated attendance tracking with real-time notifications.",
              color: "from-teal-400 to-teal-600"
            },
            {
              icon: <FaSchool className="text-2xl text-orange-600" />,
              title: "Administration Tools",
              description: "Complete school management from admissions to reporting.",
              color: "from-orange-400 to-orange-600"
            },
            {
              icon: <FaBook className="text-2xl text-pink-600" />,
              title: "Curriculum Management",
              description: "Organize and distribute curriculum materials efficiently.",
              color: "from-pink-400 to-pink-600"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              variants={item}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className={`bg-gradient-to-r ${feature.color} p-1 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto`}>
                <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Teachers Slider */}
      <section ref={ref3} className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden"
              animate={controls3}
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            >
              Meet Our <span className="text-indigo-600">Faculty</span>
            </motion.h2>
            <motion.p 
              initial="hidden"
              animate={controls3}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Our team of dedicated and experienced educators
            </motion.p>
          </div>
          
          <motion.div 
            initial="hidden"
            animate={controls3}
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative w-full overflow-hidden">
              <div className="flex snap-x snap-mandatory overflow-x-auto pb-8 -mx-4 px-4 hide-scrollbar">
                {teachers.map((teacher, index) => (
                  <div 
                    key={teacher.id}
                    className="flex-shrink-0 snap-center px-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                  >
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col"
                    >
                      <div className="relative pt-8 px-8">
                        <div className="relative w-32 h-32 mx-auto">
                          <img 
                            src={teacher.image} 
                            alt={teacher.name} 
                            className="w-full h-full object-cover rounded-full border-4 border-indigo-100"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                            <FaChalkboardTeacher className="text-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 text-center mt-4 flex-grow">
                        <h3 className="text-xl font-bold text-gray-800">{teacher.name}</h3>
                        <p className="text-indigo-600 mb-2">{teacher.subject}</p>
                        <p className="text-gray-600 text-sm mb-4">{teacher.experience} experience</p>
                        
                        <div className="flex justify-center items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={`text-lg ${i < Math.floor(teacher.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-gray-700 text-sm">{teacher.rating}</span>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            Interactive
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            Engaging
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            Supportive
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white hover:bg-indigo-100 text-indigo-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-gray-200 z-10"
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-indigo-100 text-indigo-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-gray-200 z-10"
            >
              <FaChevronRight />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={ref4} className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden"
              animate={controls4}
              variants={fadeInDown}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
            >
              Community <span className="text-indigo-600">Testimonials</span>
            </motion.h2>
            <motion.p 
              initial="hidden"
              animate={controls4}
              variants={fadeInDown}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Hear what people are saying about our institution
            </motion.p>
          </div>
          
          <motion.div 
            initial="hidden"
            animate={controls4}
            variants={container}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                quote: "This platform has transformed how we manage our school. The communication tools between teachers and parents are exceptional.",
                author: "Robert Johnson",
                role: "School Principal",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
                rating: 5
              },
              {
                quote: "As a parent, I love being able to track my child's progress in real-time. The mobile app makes it so convenient!",
                author: "Maria Garcia",
                role: "Parent",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
                rating: 4
              },
              {
                quote: "The gradebook and lesson planning tools have saved me hours each week. I can focus more on teaching!",
                author: "James Wilson",
                role: "Teacher",
                image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="relative mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <FaQuoteLeft className="text-xs" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.author}</h4>
                    <p className="text-indigo-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`text-sm ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ref5} className="py-20 px-4 md:px-8 bg-gradient-to-r from-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-400 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h2 
            initial="hidden"
            animate={controls5}
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to transform your school's management?
          </motion.h2>
          <motion.p 
            initial="hidden"
            animate={controls5}
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-xl mb-10 opacity-90"
          >
            Join hundreds of educational institutions using our platform to streamline their operations.
          </motion.p>
          <motion.div
            initial="hidden"
            animate={controls5}
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button className="bg-white hover:bg-gray-100 text-indigo-700 font-bold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg" onClick={()=>navigate('/signup')}>
              Request a Demo
            </button>
            <button className="bg-transparent hover:bg-white/10 border-2 border-white/50 text-white font-bold py-4 px-12 rounded-full transition-all duration-300 transform hover:scale-105 hover:border-white/80 text-lg" onClick={()=>navigate('/contact')}>
              Contact Us
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;