import React from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGraduationCap, FaChalkboardTeacher, FaUserGraduate, FaBook } from 'react-icons/fa';
import { redirect, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <footer className={`bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800 pt-16 pb-8 relative overflow-hidden border-t border-gray-200 ${location.pathname === '/studentchat' ? 'hidden' : 'block'} ${location.pathname === '/dashboard' ? 'hidden' : 'block'}`}>
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* School Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center">
              <FaGraduationCap className="text-3xl text-indigo-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">EduConnect</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Empowering educators and students with innovative learning solutions. Building the future of education since 2010.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FaFacebookF className="text-lg" />, color: "hover:bg-blue-600", redirect: 'https://www.facebook.com' },
                { icon: <FaTwitter className="text-lg" />, color: "hover:bg-sky-500", redirect:'https://www.twitter.com/' },
                { icon: <FaInstagram className="text-lg" />, color: "hover:bg-pink-600", redirect: 'https://www.instagram.com/deepnex.in?igsh=bjJ1bjUybXozZmh6' },
                { icon: <FaLinkedinIn className="text-lg" />, color: "hover:bg-blue-700", redirect: 'https://www.linkedin.com/company/deepnex/posts/?feedView=all' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.redirect || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 ${social.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { text: "About Our School", icon: <FaGraduationCap className="mr-2 text-indigo-500" /> },
                { text: "Our Teachers", icon: <FaChalkboardTeacher className="mr-2 text-indigo-500" /> },
                { text: "Student Portal", icon: <FaUserGraduate className="mr-2 text-indigo-500" /> },
                { text: "Academic Calendar", icon: <FaBook className="mr-2 text-indigo-500" /> },
                { text: "Events", icon: <FaBook className="mr-2 text-indigo-500" /> },
                { text: "Contact Admissions", icon: <FaEnvelope className="mr-2 text-indigo-500" /> }
              ].map((link, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-800 hover:font-medium transition-colors duration-300 flex items-center group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    {link.text}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Academic Programs */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Programs</h3>
            <ul className="space-y-3">
              {[
                "Elementary School",
                "Middle School",
                "High School",
                "STEM Program",
                "Arts & Humanities",
                "Sports Academy",
                "International Baccalaureate"
              ].map((program, index) => (
                <motion.li 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-gray-800 hover:font-medium transition-colors duration-300 flex items-center"
                  >
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {program}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Contact Us</h3>
            <div className="space-y-4">
              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="flex items-start group"
              >
                <div className="bg-indigo-100 p-2 rounded-lg mr-4 group-hover:bg-indigo-200 transition-colors duration-300">
                  <FaMapMarkerAlt className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">School Address</p>
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 text-sm"
                  >
                    123 Education Ave, Learning City, LC 54321
                  </a>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="flex items-start group"
              >
                <div className="bg-indigo-100 p-2 rounded-lg mr-4 group-hover:bg-indigo-200 transition-colors duration-300">
                  <FaPhoneAlt className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Call Us</p>
                  <div className="space-y-1">
                    <a 
                      href="tel:+11234567890" 
                      className="block text-gray-600 hover:text-indigo-600 transition-colors duration-300 text-sm"
                    >
                      Main: +1 (123) 456-7890
                    </a>
                    <a 
                      href="tel:+11234567891" 
                      className="block text-gray-600 hover:text-indigo-600 transition-colors duration-300 text-sm"
                    >
                      Admissions: +1 (123) 456-7891
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="flex items-start group"
              >
                <div className="bg-indigo-100 p-2 rounded-lg mr-4 group-hover:bg-indigo-200 transition-colors duration-300">
                  <FaEnvelope className="text-indigo-600 text-lg" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Email Us</p>
                  <div className="space-y-1">
                    <a 
                      href="mailto:info@educonnect.com" 
                      className="block text-gray-600 hover:text-indigo-600 transition-colors duration-300 text-sm"
                    >
                      info@educonnect.com
                    </a>
                    <a 
                      href="mailto:admissions@educonnect.com" 
                      className="block text-gray-600 hover:text-indigo-600 transition-colors duration-300 text-sm"
                    >
                      admissions@educonnect.com
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider and Copyright */}
        <motion.div 
          className="border-t border-gray-300 mt-12 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} EduConnect School. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">Accessibility</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium">Sitemap</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;