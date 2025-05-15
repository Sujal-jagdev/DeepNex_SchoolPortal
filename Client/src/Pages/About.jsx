import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher, FaSchool, FaAward, FaGraduationCap, FaPhone, FaCalendarAlt } from 'react-icons/fa';

const About = () => {
  const [teachers, setTeachers] = useState([]);
  const [currentTeacherIndex, setCurrentTeacherIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Unique teacher images from Unsplash with education theme
  const teacherImages = [
    'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Female teacher 1
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Male teacher 1
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Female teacher 2
    'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Male teacher 2
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Female teacher 3
    'https://images.unsplash.com/photo-1541178735493-479c1a27ed24?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Male teacher 3
    'https://images.unsplash.com/photo-1522205408450-add114ad53fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', // Female teacher 4
    'https://images.unsplash.com/photo-1542190891-2093d38760f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'  // Male teacher 4
  ];

  // Mock data with unique images
  const mockTeachers = [
    {
      _id: '1',
      name: 'Ms. Sarah Johnson',
      image: teacherImages[0],
      specialization: 'Mathematics',
      qualifications: ['M.Ed, Harvard Graduate School of Education', 'Certified Math Specialist', 'PhD in Education'],
      experience: '18 years',
      bio: 'Ms. Johnson specializes in making complex mathematical concepts accessible to all students. She has developed innovative teaching methods that improve student engagement and understanding.'
    },
    {
      _id: '2',
      name: 'Mr. Michael Chen',
      image: teacherImages[1],
      specialization: 'Science',
      qualifications: ['M.Ed, Stanford University', 'Specialization in STEM Education', 'Board Certified Science Teacher'],
      experience: '12 years',
      bio: 'Mr. Chen is passionate about hands-on science education and has led multiple award-winning student research projects at regional science fairs.'
    },
    {
      _id: '3',
      name: 'Mrs. Priya Patel',
      image: teacherImages[2],
      specialization: 'English Literature',
      qualifications: ['M.A. in English, Oxford University', 'Certified Reading Specialist', 'TESOL Certification'],
      experience: '15 years',
      bio: 'Mrs. Patel has dedicated her career to fostering a love of literature and writing. Her students consistently achieve top marks in national writing competitions.'
    },
    {
      _id: '4',
      name: 'Dr. Robert Williams',
      image: teacherImages[3],
      specialization: 'History',
      qualifications: ['Ph.D in History, Yale University', 'National Board Certified Teacher', 'Fulbright Scholar'],
      experience: '20 years',
      bio: 'Dr. Williams brings history to life through immersive storytelling and primary source analysis. His students develop critical thinking skills that serve them beyond the classroom.'
    },
    {
      _id: '5',
      name: 'Ms. Emily Zhang',
      image: teacherImages[4],
      specialization: 'Art',
      qualifications: ['M.F.A. in Fine Arts, RISD', 'Certified Art Educator', 'Exhibiting Artist'],
      experience: '10 years',
      bio: 'Ms. Zhang helps students discover their creative potential while building strong technical skills across multiple artistic mediums.'
    },
    {
      _id: '6',
      name: 'Mr. David Kim',
      image: teacherImages[5],
      specialization: 'Music',
      qualifications: ['M.M. in Music Education, Juilliard', 'Orff-Schulwerk Certified', 'Professional Musician'],
      experience: '14 years',
      bio: 'Mr. Kim leads our award-winning music program, teaching students to appreciate and create music across genres and cultures.'
    }
  ];

  // Fetch teachers from API or use mock data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          'https://your-api-endpoint.com/api/teachers'
        );
        // Enhance API data with unique images if needed
        const teachersWithImages = response.data.teachersData?.map((teacher, index) => ({
          ...teacher,
          image: teacher.image || teacherImages[index % teacherImages.length]
        }));
        setTeachers(teachersWithImages?.length > 0 ? teachersWithImages : mockTeachers);
        setLoading(false);
      } catch (err) {
        console.error('Using mock data due to:', err.message);
        setTeachers(mockTeachers);
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Auto-rotate teachers every 4 seconds
  useEffect(() => {
    if (teachers.length > 1) {
      const interval = setInterval(() => {
        setCurrentTeacherIndex((prevIndex) =>
          (prevIndex + 1) % teachers.length
        );
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [teachers.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <div className="text-blue-600 text-2xl font-medium">Loading our teaching team...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">We're showing sample data. {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentTeacher = teachers[currentTeacherIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-white"></div>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Exceptional Education from Dedicated Professionals</h1>
          <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto">
            Our team of certified educators is committed to nurturing young minds and fostering lifelong learning
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
              <FaSchool className="mr-2 text-blue-300" />
              <span>Comprehensive Curriculum</span>
            </div>
            <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
              <FaAward className="mr-2 text-blue-300" />
              <span>Certified Educators</span>
            </div>
            <div className="flex items-center bg-white/20 px-4 py-2 rounded-full">
              <FaGraduationCap className="mr-2 text-blue-300" />
              <span>Personalized Learning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
          <div className="text-gray-600">Years Combined Experience</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">24</div>
          <div className="text-gray-600">Subject Specializations</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
          <div className="text-gray-600">Students Taught</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
          <div className="text-gray-600">Student Satisfaction Rate</div>
        </div>
      </div>

      {/* Featured Teacher Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Teacher Image */}
            <div className="relative h-96 md:h-auto group">
              <img
                src={currentTeacher.image}
                alt={currentTeacher.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                  <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    "My philosophy is to inspire every student to discover their potential and love of learning."
                  </p>
                </div>
              </div>
              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {teachers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTeacherIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentTeacherIndex ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Go to teacher ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Teacher Info */}
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">{currentTeacher.name}</h2>
                  <p className="text-blue-600 text-lg font-medium flex items-center">
                    <FaChalkboardTeacher className="mr-2" />
                    {currentTeacher.specialization}
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Available
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <FaAward className="mr-2 text-blue-500" />
                  Qualifications
                </h3>
                <ul className="space-y-2 text-gray-600">
                  {currentTeacher.qualifications?.map((qual, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {qual}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <FaSchool className="mr-2 text-blue-500" />
                  Experience
                </h3>
                <p className="text-gray-600 pl-8">{currentTeacher.experience} of dedicated teaching</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                  <FaGraduationCap className="mr-2 text-blue-500" />
                  Teaching Philosophy
                </h3>
                <p className="text-gray-600 pl-8">
                  {currentTeacher.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Team Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Teaching Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet our diverse team of educators dedicated to academic excellence and student growth
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teachers.map((teacher, index) => (
            <div
              key={teacher._id || index}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${currentTeacherIndex === index ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setCurrentTeacherIndex(index)}
            >
              <div className="relative h-64 overflow-hidden group">
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{teacher.name}</h3>
                    <p className="text-blue-200 text-sm">{teacher.specialization}</p>
                    <button className="mt-2 text-white text-sm font-medium hover:text-blue-300 transition">
                      View Profile →
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{teacher.name}</h3>
                <p className="text-blue-600 text-sm mb-2">{teacher.specialization}</p>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {teacher.bio}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{teacher.experience} experience</span>
                  <button className="text-blue-600 text-xs font-medium hover:text-blue-800 transition">
                    Learn more
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Educational Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 text-3xl mb-4 font-semibold">01</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Student-Centered Learning</h3>
              <p className="text-gray-600">
                We prioritize each student's unique learning style and needs, creating personalized educational experiences.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 text-3xl mb-4 font-semibold">02</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Academic Excellence</h3>
              <p className="text-gray-600">
                Our educators maintain the highest teaching standards through continuous professional development.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 text-3xl mb-4 font-semibold">03</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Holistic Development</h3>
              <p className="text-gray-600">
                We nurture not just academic skills but also character, creativity, and critical thinking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute bottom-1/3 right-1/3 w-40 h-40 rounded-full bg-white"></div>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Learn More?</h2>
          <p className="text-xl mb-8">
            Schedule a meeting with one of our educators today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg">
              <FaCalendarAlt className="mr-2" />
              Schedule Visit
            </button>
            <button className="flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition transform hover:scale-105">
              <FaPhone className="mr-2" />
              Contact Us
            </button>
          </div>
          <p className="mt-6 text-blue-200 text-sm">
            Personalized tours available to experience our learning environment
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;