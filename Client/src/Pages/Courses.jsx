import { useState } from 'react';

const Courses = () => {
  // Mock course data
  const coursesData = [
    {
      id: 1,
      title: 'Introduction to Computer Science',
      category: 'Computer Science',
      description: 'Learn the fundamentals of computer science and programming.',
      image: 'https://via.placeholder.com/300x200?text=Computer+Science',
    },
    {
      id: 2,
      title: 'Advanced Mathematics',
      category: 'Mathematics',
      description: 'Explore advanced mathematical concepts and problem-solving techniques.',
      image: 'https://via.placeholder.com/300x200?text=Mathematics',
    },
    {
      id: 3,
      title: 'Physics for Beginners',
      category: 'Science',
      description: 'Understand the basic principles of physics and their applications.',
      image: 'https://via.placeholder.com/300x200?text=Physics',
    },
    {
      id: 4,
      title: 'English Literature',
      category: 'Humanities',
      description: 'Analyze classic and contemporary works of English literature.',
      image: 'https://via.placeholder.com/300x200?text=Literature',
    },
    {
      id: 5,
      title: 'Introduction to Psychology',
      category: 'Social Sciences',
      description: 'Explore the human mind and behavior through psychological theories.',
      image: 'https://via.placeholder.com/300x200?text=Psychology',
    },
    {
      id: 6,
      title: 'Web Development Fundamentals',
      category: 'Computer Science',
      description: 'Learn HTML, CSS, and JavaScript to build modern websites.',
      image: 'https://via.placeholder.com/300x200?text=Web+Development',
    },
  ];

  // Get unique categories for filter
  const categories = ['All', ...new Set(coursesData.map(course => course.category))];

  // State for filtered courses
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter courses based on selected category
  const filteredCourses = selectedCategory === 'All' 
    ? coursesData 
    : coursesData.filter(course => course.category === selectedCategory);

  return (
    <div className="bg-white py-12 pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Courses</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${selectedCategory === category 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-[#1E1E1E] hover:bg-gray-200'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div key={course.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <span className="text-sm text-primary font-medium">{course.category}</span>
                <h3 className="text-xl font-semibold mt-2 mb-3">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <button className="btn btn-primary w-full">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No courses found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;