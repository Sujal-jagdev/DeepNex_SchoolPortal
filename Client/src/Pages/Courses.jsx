import React from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaGraduationCap, FaSchool, FaClipboardList, FaCalendarAlt, FaPhone, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Courses = () => {
  const courses = {
    teacher: [
      {
        title: "Professional Development",
        description: "Enhance your teaching skills with our specialized training programs.",
        icon: <FaChalkboardTeacher className="text-3xl" />,
        details: [
          "Pedagogical techniques workshops",
          "Curriculum development training",
          "Classroom management strategies",
          "Technology integration courses"
        ],
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        color: "bg-blue-100",
        textColor: "text-blue-800"
      },
      {
        title: "Teacher Resources",
        description: "Comprehensive materials to support your daily teaching needs.",
        icon: <FaBook className="text-3xl" />,
        details: [
          "Lesson plan templates",
          "Assessment tools",
          "Differentiated instruction resources",
          "Subject-specific teaching materials"
        ],
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        color: "bg-purple-100",
        textColor: "text-purple-800"
      }
    ],
    student: [
      {
        title: "Academic Programs",
        description: "Comprehensive curriculum designed for student success.",
        icon: <FaUserGraduate className="text-3xl" />,
        details: [
          "Core subject courses",
          "Advanced placement options",
          "STEM-focused programs",
          "Arts and humanities electives"
        ],
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        color: "bg-emerald-100",
        textColor: "text-emerald-800"
      },
      {
        title: "Extracurricular Activities",
        description: "Enriching programs beyond the classroom.",
        icon: <FaGraduationCap className="text-3xl" />,
        details: [
          "Sports teams and athletics",
          "Academic clubs and competitions",
          "Arts and performance groups",
          "Community service opportunities"
        ],
        image: "https://images.unsplash.com/photo-1541178735493-479c1a27ed24?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        color: "bg-amber-100",
        textColor: "text-amber-800"
      }
    ],
    admissions: [
      {
        title: "Application Process",
        description: "Step-by-step guidance for prospective students.",
        icon: <FaClipboardList className="text-3xl" />,
        details: [
          "Application requirements",
          "Deadlines and important dates",
          "Document submission guidelines",
          "Admission criteria"
        ],
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        color: "bg-rose-100",
        textColor: "text-rose-800"
      },
      {
        title: "School Information",
        description: "Learn about our institution and community.",
        icon: <FaSchool className="text-3xl" />,
        details: [
          "School facilities tour",
          "Faculty profiles",
          "Academic calendar",
          "Tuition and financial aid"
        ],
        image: "https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
        color: "bg-indigo-100",
        textColor: "text-indigo-800"
      }
    ]
  };

  // Animation configurations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const container = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-20"
        >
          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full mb-6 text-sm font-medium">
            Welcome to Our Learning Community
          </div>
          <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl mb-6">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Exceptional</span> Education
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600">
            Empowering teachers and students with innovative programs and resources
          </p>
        </motion.div>

        {/* Teacher Courses Section */}
        <motion.section 
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={container}
        >
          <motion.div className="flex items-center mb-10" variants={fadeIn}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-lg mr-4 shadow-lg">
              <FaChalkboardTeacher className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Educator Resources</h2>
              <p className="text-gray-500">Tools and programs to enhance your teaching practice</p>
            </div>
          </motion.div>
          <motion.div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2" variants={container}>
            {courses.teacher.map((course, index) => (
              <ModernCourseCard key={`teacher-${index}`} course={course} index={index} />
            ))}
          </motion.div>
        </motion.section>

        {/* Student Courses Section */}
        <motion.section 
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={container}
        >
          <motion.div className="flex items-center mb-10" variants={fadeIn}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-lg mr-4 shadow-lg">
              <FaUserGraduate className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Student Programs</h2>
              <p className="text-gray-500">Comprehensive learning experiences for all students</p>
            </div>
          </motion.div>
          <motion.div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2" variants={container}>
            {courses.student.map((course, index) => (
              <ModernCourseCard key={`student-${index}`} course={course} index={index} />
            ))}
          </motion.div>
        </motion.section>

        {/* Admissions Section */}
        <motion.section 
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={container}
        >
          <motion.div className="flex items-center mb-10" variants={fadeIn}>
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-3 rounded-lg mr-4 shadow-lg">
              <FaSchool className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Admissions Center</h2>
              <p className="text-gray-500">Everything you need to join our learning community</p>
            </div>
          </motion.div>
          <motion.div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2" variants={container}>
            {courses.admissions.map((course, index) => (
              <ModernCourseCard key={`admissions-${index}`} course={course} index={index} />
            ))}
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.div 
          className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-2xl overflow-hidden mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeIn}
        >
          <div className="md:flex">
            <div className="md:w-1/2 p-12 text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Education?</h2>
              <p className="text-xl mb-8 text-indigo-100">Join our community of passionate educators and learners today.</p>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-lg mr-4 backdrop-blur-sm">
                    <FaPhone className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Main Office</h3>
                    <p className="text-indigo-100">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-lg mr-4 backdrop-blur-sm">
                    <FaCalendarAlt className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Admissions</h3>
                    <p className="text-indigo-100">admissions@ourschool.edu</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-white p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Get Started</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                  <select className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700">
                    <option>Select your role</option>
                    <option>Prospective Student</option>
                    <option>Current Student</option>
                    <option>Teacher/Staff</option>
                    <option>Parent/Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interested In</label>
                  <select className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700">
                    <option>Select interest</option>
                    <option>Academic Programs</option>
                    <option>Extracurricular Activities</option>
                    <option>Admissions Process</option>
                    <option>Professional Development</option>
                  </select>
                </div>
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Submit Inquiry</span>
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={container}
        >
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg text-center"
            variants={fadeIn}
          >
            <div className="text-5xl font-bold text-indigo-600 mb-3">98%</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Graduation Rate</h3>
            <p className="text-gray-500">Our students consistently achieve academic success</p>
          </motion.div>
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg text-center"
            variants={fadeIn}
          >
            <div className="text-5xl font-bold text-indigo-600 mb-3">50+</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Programs Offered</h3>
            <p className="text-gray-500">Diverse learning opportunities for all interests</p>
          </motion.div>
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg text-center"
            variants={fadeIn}
          >
            <div className="text-5xl font-bold text-indigo-600 mb-3">100%</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Certified Teachers</h3>
            <p className="text-gray-500">Highly qualified educators in every classroom</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Modern Course Card Component
const ModernCourseCard = ({ course, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-2xl shadow-lg ${course.color} hover:shadow-xl transition-all duration-300`}
      whileHover={{ y: -5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm z-10"></div>
      <div className="relative z-20 p-8 h-full flex flex-col">
        <div className={`w-16 h-16 ${course.color} rounded-xl flex items-center justify-center mb-6 shadow-md`}>
          {course.icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h3>
        <p className="text-gray-700 mb-6">{course.description}</p>
        
        <div className="mt-auto">
          <div className="bg-white/80 rounded-xl p-4 backdrop-blur-sm">
            <h4 className="font-semibold mb-3">Key Features:</h4>
            <ul className="space-y-2">
              {course.details.map((detail, i) => (
                <li key={i} className="flex items-start">
                  <span className={`${course.textColor} mr-2 mt-1`}>•</span>
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <motion.button
            className={`mt-6 ${course.textColor} font-medium flex items-center space-x-2`}
            whileHover={{ x: 5 }}
          >
            <span>Learn more</span>
            <FaArrowRight className="text-sm" />
          </motion.button>
        </div>
      </div>
      <img
        src={course.image}
        alt={course.title}
        className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
      />
    </motion.div>
  );
};

export default Courses;