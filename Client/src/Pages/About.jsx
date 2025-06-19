const About = () => {
  // Mock team data
  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Jane Smith',
      role: 'Founder & CEO',
      bio: 'Dr. Smith has over 15 years of experience in educational technology and AI research.',
      image: 'https://via.placeholder.com/150?text=JS',
    },
    {
      id: 2,
      name: 'Prof. Michael Johnson',
      role: 'Chief Academic Officer',
      bio: 'Professor Johnson specializes in curriculum development and educational assessment.',
      image: 'https://via.placeholder.com/150?text=MJ',
    },
    {
      id: 3,
      name: 'Sarah Williams',
      role: 'Head of AI Development',
      bio: 'Sarah leads our AI team, focusing on creating intelligent educational tools.',
      image: 'https://via.placeholder.com/150?text=SW',
    },
    {
      id: 4,
      name: 'David Chen',
      role: 'UX/UI Director',
      bio: 'David ensures our platform provides an intuitive and engaging user experience.',
      image: 'https://via.placeholder.com/150?text=DC',
    },
  ];

  return (
    <div className="bg-white py-12 pt-24">
      <div className="container mx-auto px-4 text-black">
        {/* About Section */}
        <section className="mb-16">
          <div className="flex flex-col items-center justify-center mb-8">
            <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-20 w-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-center font-display">About <span className="text-bright-green">EduNex</span></h1>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-6">
              EduNex is an innovative AI-integrated educational platform designed to transform the way educational institutions operate. Our mission is to provide a seamless experience for students, teachers, department heads, and administrators through role-based access and intelligent features.
            </p>
            
            <p className="text-lg mb-6">
              Founded in 2023, EduNex combines cutting-edge AI technology with educational expertise to create a platform that enhances learning outcomes, streamlines administrative tasks, and provides valuable insights through comprehensive analytics.
            </p>
            
            <p className="text-lg">
              Our team consists of educators, technologists, and AI specialists who are passionate about improving education through technology. We believe that by providing the right tools to all stakeholders in the educational ecosystem, we can help create more effective and engaging learning environments.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
              <p className="text-lg">
                To empower educational institutions with AI-driven tools that enhance teaching, learning, and administration, making education more accessible, personalized, and effective for all stakeholders.
              </p>
            </div>
            
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 text-primary">Our Vision</h2>
              <p className="text-lg">
                To be the leading provider of AI-integrated educational platforms, transforming how institutions operate and how knowledge is shared, ultimately improving educational outcomes worldwide.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;