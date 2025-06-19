import { useState, useEffect } from 'react';
import { lessonPlanningService } from '../../services/api';
import './LessonPlanning.css'; // We'll create this CSS file next
import { toast } from 'react-hot-toast';

const LessonPlanning = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [duration, setDuration] = useState('');
  const [language, setLanguage] = useState('english');
  const [standard, setStandard] = useState('6-8'); // Add standard state variable with default value
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('Lesson plan saved successfully!');
  const [generatedLessonPlan, setGeneratedLessonPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  
  // Add animation effect when component mounts
  useEffect(() => {
    setTimeout(() => {
      setAnimateCards(true);
    }, 300);
  }, []);
  
  // Get user ID from localStorage (would be set during login)
  const userId = localStorage.getItem('userId') || '1'; // Default to '1' for testing
  
  // Fetch saved lesson plans on component mount (from sessions and chatHistory tables)
  useEffect(() => {
    const fetchSavedPlans = async () => {
      try {
        setLoading(true);
        // Use the actual userId instead of hardcoded '1'
        const response = await lessonPlanningService.getTeacherLessonPlans(userId);
        console.log('API Response:', response); // Log the full response
        console.log('Lesson Plans from API:', response.lessonPlans); // Log the lessonPlans array
        
        // Check if we have lesson plans in the response
        if (response.lessonPlans && response.lessonPlans.length > 0) {
          console.log('First lesson plan:', response.lessonPlans[0]); // Log the first lesson plan
        } else {
          console.log('No lesson plans found in response');
        }
        
        setSavedPlans(response.lessonPlans || []);
        console.log('Saved Plans State after update:', response.lessonPlans || []); // Log what we're setting to state
      } catch (err) {
        console.error('Error fetching saved plans:', err);
        // Initialize with empty array to prevent errors
        setSavedPlans([]);
        // Show a temporary error message
        setError('Unable to load saved lesson plans from database. Please try again later.');
        // Clear the error message after 5 seconds
        setTimeout(() => setError(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a valid userId
    if (userId) {
      console.log('Fetching lesson plans for userId:', userId); // Log the userId
      fetchSavedPlans();
    }
  }, [userId]);
  
  // Mock lesson templates
  const lessonTemplates = [
    {
      id: 1,
      title: 'Introduction to a New Topic',
      description: 'A template for introducing students to a new subject area or concept',
      icon: '🚀',
      color: 'bg-blue-100 border-blue-300',
    },
    {
      id: 2,
      title: 'Skill Practice Session',
      description: 'A template focused on practicing and reinforcing specific skills',
      icon: '🔄',
      color: 'bg-green-100 border-green-300',
    },
    {
      id: 3,
      title: 'Review and Assessment',
      description: 'A template for reviewing previously learned material and assessment',
      icon: '📝',
      color: 'bg-yellow-100 border-yellow-300',
    },
    {
      id: 4,
      title: 'Project-Based Learning',
      description: 'A template for guiding students through project-based activities',
      icon: '🏗️',
      color: 'bg-purple-100 border-purple-300',
    },
    {
      id: 5,
      title: 'Discussion and Debate',
      description: 'A template for facilitating classroom discussions and debates',
      icon: '💬',
      color: 'bg-pink-100 border-pink-300',
    },
    {
      id: 6,
      title: 'Interactive Multimedia',
      description: 'A template incorporating videos, simulations, and interactive content',
      icon: '🎮',
      color: 'bg-indigo-100 border-indigo-300',
    },
  ];

  // Generate a lesson plan based on template, topic and duration
  const generateLessonPlan = () => {
    const template = lessonTemplates.find(t => t.id === selectedCard);
    
    // Different sections based on template type
    let sections = [];
    
    switch(template.id) {
      case 1: // Introduction to a New Topic
        // Different content based on selected language
        if (language === 'hindi') {
          sections = [
            { title: 'वार्म-अप गतिविधि', duration: '10 minutes', content: 'नए विषय में रुचि जगाने के लिए एक आकर्षक गतिविधि के साथ शुरुआत करें।' },
            { title: 'मुख्य अवधारणाओं का परिचय', duration: '15 minutes', content: `"${topicName}" की मुख्य अवधारणाओं को दृश्य सहायता और उदाहरणों का उपयोग करके प्रस्तुत करें।` },
            { title: 'निर्देशित अभ्यास', duration: '15 minutes', content: 'नई अवधारणाओं के साथ प्रारंभिक अभ्यास के माध्यम से छात्रों का मार्गदर्शन करें।' },
            { title: 'प्रश्न-उत्तर सत्र', duration: '5 minutes', content: 'नई सामग्री के बारे में छात्रों के प्रश्नों का समाधान करें।' },
            { title: 'गृहकार्य असाइनमेंट', duration: '5 minutes', content: 'आज की सीखी गई बातों को मजबूत करने वाले गृहकार्य के बारे में बताएं।' },
          ];
        } else if (language === 'gujarati') {
          sections = [
            { title: 'વોર્મ-અપ પ્રવૃત્તિ', duration: '10 minutes', content: 'નવા વિષયમાં રસ જગાવવા માટે એક આકર્ષક પ્રવૃત્તિથી શરૂઆત કરો.' },
            { title: 'મુખ્ય વિભાવનાઓનો પરિચય', duration: '15 minutes', content: `"${topicName}"ની મુખ્ય વિભાવનાઓને દૃશ્ય સહાય અને ઉદાહરણોનો ઉપયોગ કરીને રજૂ કરો.` },
            { title: 'માર્ગદર્શિત અભ્યાસ', duration: '15 minutes', content: 'નવી વિભાવનાઓ સાથે પ્રારંભિક અભ્યાસ દ્વારા વિદ્યાર્થીઓને માર્ગદર્શન આપો.' },
            { title: 'પ્રશ્નોત્તરી સત્ર', duration: '5 minutes', content: 'નવી સામગ્રી વિશે વિદ્યાર્થીઓના પ્રશ્નોનું સમાધાન કરો.' },
            { title: 'હોમવર્ક અસાઇનમેન્ટ', duration: '5 minutes', content: 'આજે શીખેલી બાબતોને મજબૂત કરતા હોમવર્ક વિશે સમજાવો.' },
          ];
        } else {
          sections = [
            { title: 'Warm-up Activity', duration: '10 minutes', content: 'Begin with an engaging activity to spark interest in the new topic.' },
            { title: 'Introduction to Key Concepts', duration: '15 minutes', content: `Present the main concepts of "${topicName}" using visual aids and examples.` },
            { title: 'Guided Practice', duration: '15 minutes', content: 'Walk students through initial practice with the new concepts.' },
            { title: 'Q&A Session', duration: '5 minutes', content: 'Address student questions about the new material.' },
            { title: 'Homework Assignment', duration: '5 minutes', content: 'Explain the homework that will reinforce today\'s learning.' },
          ];
        }
        break;
      case 2: // Skill Practice Session
        sections = [
          { title: 'Review of Concepts', duration: '10 minutes', content: `Quick review of the key concepts related to "${topicName}".` },
          { title: 'Demonstration', duration: '10 minutes', content: 'Demonstrate the skills with examples.' },
          { title: 'Individual Practice', duration: '15 minutes', content: 'Students practice independently with teacher support.' },
          { title: 'Group Practice', duration: '15 minutes', content: 'Students work in pairs or small groups to practice skills.' },
          { title: 'Assessment', duration: '10 minutes', content: 'Quick assessment to gauge understanding.' },
        ];
        break;
      case 3: // Review and Assessment
        sections = [
          { title: 'Recap of Previous Learning', duration: '15 minutes', content: `Review the key points of "${topicName}" covered previously.` },
          { title: 'Practice Questions', duration: '20 minutes', content: 'Students work through practice questions to reinforce learning.' },
          { title: 'Common Misconceptions', duration: '10 minutes', content: 'Address common errors and misconceptions.' },
          { title: 'Assessment', duration: '15 minutes', content: 'Formal or informal assessment to gauge understanding.' },
        ];
        break;
      case 4: // Project-Based Learning
        sections = [
          { title: 'Project Introduction', duration: '10 minutes', content: `Introduce the project related to "${topicName}" and its objectives.` },
          { title: 'Planning Phase', duration: '15 minutes', content: 'Students plan their approach to the project.' },
          { title: 'Research/Work Time', duration: '25 minutes', content: 'Students work on their projects with teacher guidance.' },
          { title: 'Progress Check', duration: '5 minutes', content: 'Brief check-in on project progress.' },
          { title: 'Next Steps', duration: '5 minutes', content: 'Outline what students should prepare for the next session.' },
        ];
        break;
      case 5: // Discussion and Debate
        sections = [
          { title: 'Topic Introduction', duration: '10 minutes', content: `Introduce the discussion topic "${topicName}" and set ground rules.` },
          { title: 'Preparation Time', duration: '15 minutes', content: 'Students prepare their points and gather evidence.' },
          { title: 'Structured Discussion/Debate', duration: '25 minutes', content: 'Facilitate the discussion or debate.' },
          { title: 'Reflection', duration: '10 minutes', content: 'Students reflect on the discussion and key takeaways.' },
        ];
        break;
      case 6: // Interactive Multimedia
        sections = [
          { title: 'Introduction', duration: '5 minutes', content: `Introduce the topic "${topicName}" and the multimedia resources.` },
          { title: 'Multimedia Presentation', duration: '15 minutes', content: 'Present the interactive content or video.' },
          { title: 'Interactive Activity', duration: '20 minutes', content: 'Students engage with interactive simulations or activities.' },
          { title: 'Discussion', duration: '10 minutes', content: 'Discuss insights and learning from the multimedia content.' },
          { title: 'Application Task', duration: '10 minutes', content: 'Students apply what they learned to a new situation.' },
        ];
        break;
      default:
        sections = [
          { title: 'Introduction', duration: '10 minutes', content: `Introduce the topic "${topicName}".` },
          { title: 'Main Activity', duration: '30 minutes', content: 'Main learning activity.' },
          { title: 'Conclusion', duration: '10 minutes', content: 'Summarize key points and check understanding.' },
        ];
    }
    
    return {
      title: `${template.title}: ${topicName}`,
      duration: `${duration} minutes`,
      sections: sections
    };
  };

  // Generate a lesson plan using Mistral AI
  const generateLessonPlanWithAI = async () => {
    try {
      setGeneratingPlan(true);
      setError(null);
      
      const template = lessonTemplates.find(t => t.id === selectedCard);
      
      const response = await lessonPlanningService.generateLessonPlanWithAI(
        template.title,
        topicName,
        duration,
        language,
        standard // Pass standard to the API
      );
      
      // Handle the response from the server
      let parsedLessonPlan;
      
      // The server now sends the lesson plan as a parsed JSON object
      // so we don't need to parse it again
      if (response.lessonPlan) {
        parsedLessonPlan = response.lessonPlan;
        console.log('Received lesson plan:', parsedLessonPlan);
      } else {
        // Fallback if no lesson plan in response
        parsedLessonPlan = {
          title: `${template.title}: ${topicName}`,
          duration: `${duration} minutes`,
          content: 'Could not generate lesson plan. Please try again.'
        };
      }
      
      setGeneratedLessonPlan(parsedLessonPlan);
      return parsedLessonPlan;
    } catch (error) {
      console.error('Error generating lesson plan with AI:', error);
      
      // Create a fallback lesson plan when API fails
      const template = lessonTemplates.find(t => t.id === selectedCard);
      const fallbackPlan = {
        title: `${template.title}: ${topicName}`,
        duration: `${duration} minutes`,
        story: 'Once upon a time in a classroom not so far away...',
        realWorldExamples: ['This is a locally generated example as the AI service is currently unavailable.'],
        factsAndFigures: ['Did you know that locally generated content can be just as effective?'],
        learningObjectives: ['Understand the basic concepts of ' + topicName, 'Apply knowledge in practical scenarios'],
        requiredMaterials: ['Textbook', 'Notebook', 'Pencils/Pens'],
        activities: [
          { title: 'Introduction', duration: '10 minutes', description: 'Introduce the topic and set learning objectives' },
          { title: 'Main Activity', duration: '25 minutes', description: 'Students work on understanding key concepts' },
          { title: 'Conclusion', duration: '10 minutes', description: 'Summarize learning and check understanding' }
        ],
        assessmentStrategies: ['Class participation', 'Exit ticket with 3 key takeaways'],
        homeworkOrFollowUpActivities: ['Research one aspect of ' + topicName + ' and prepare a short presentation'],
        practiceExercises: ['Complete the worksheet on ' + topicName]
      };
      
      setError('Failed to connect to the AI service. Using locally generated lesson plan instead.');
      setGeneratedLessonPlan(fallbackPlan);
      return fallbackPlan;
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleCardClick = (id) => {
    setSelectedCard(id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(false);
    
    // Generate lesson plan using Mistral AI
    const aiGeneratedPlan = await generateLessonPlanWithAI();
    
    // If AI generation failed, fall back to the local generation
    if (!aiGeneratedPlan) {
      console.log('Falling back to local lesson plan generation');
      toast.error('AI generation failed. Using local generation instead.');
    } else {
      toast.success('Lesson plan generated successfully!');
    }
    
    setShowLessonPlan(true);
  };
  
  // Save the current lesson plan to the database (using sessions and chatHistory tables)
  const saveLessonPlan = async () => {
    if (!lessonPlan) return;
    
    try {
      setLoading(true);
      setSaveSuccess(false);
      
      // Prepare the complete lesson plan data to save
      const planToSave = {
        teacherId: userId,
        templateId: selectedCard,
        title: lessonPlan.title,
        topicName,
        duration,
        language,
        standard, // Add standard to saved plan
        createdAt: new Date().toISOString()
      };
      
      // If it's an AI generated plan, include all its properties
      if (generatedLessonPlan) {
        // Include all properties from the AI generated plan
        Object.assign(planToSave, generatedLessonPlan);
      } else {
        // Include sections from the locally generated plan
        planToSave.sections = lessonPlan.sections;
      }
      
      // Save the lesson plan (backend will handle storing in sessions and chatHistory)
      await lessonPlanningService.saveLessonPlan(planToSave);
      
      // Refresh the saved plans list
      const response = await lessonPlanningService.getTeacherLessonPlans(userId);
      setSavedPlans(response.lessonPlans || []);
      
      setSaveSuccess(true);
      setSaveSuccessMessage('Lesson plan saved successfully!');
      toast.success('Lesson plan saved successfully!');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error saving lesson plan:', err);
      setError('Failed to save lesson plan');
      toast.error('Failed to save lesson plan');
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowLessonPlan(false);
    setSelectedCard(null);
    setTopicName('');
    setDuration('');
  };
  
  // Function to delete a lesson plan
  const deleteLessonPlan = async (planId) => {
    if (!planId) {
      setError("Cannot delete lesson plan: Invalid plan ID");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this lesson plan? This action cannot be undone.")) {
      try {
        setLoading(true);
        await lessonPlanningService.deleteLessonPlan(planId);
        
        // Remove the deleted plan from the savedPlans state
        setSavedPlans(savedPlans.filter(plan => plan.id !== planId));
        
        // Show success message
        setSaveSuccess(true);
        setSaveSuccessMessage("लेसन प्लान सफलतापूर्वक हटा दिया गया!");
        toast.success("लेसन प्लान सफलतापूर्वक हटा दिया गया!");
        
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error("Error deleting lesson plan:", error);
        setError("लेसन प्लान हटाने में विफल। कृपया पुनः प्रयास करें।");
        toast.error("लेसन प्लान हटाने में विफल");
        setTimeout(() => setError(null), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'saved'
  
  // Use AI generated lesson plan if available, otherwise fall back to local generation
  const lessonPlan = generatedLessonPlan || (selectedCard ? generateLessonPlan() : null);

  // Render lesson plan content based on its format
  const renderLessonPlanContent = () => {
    console.log('Rendering lesson plan content');
    
    // Use the generated lesson plan directly if available, otherwise use the local lesson plan
    const plan = generatedLessonPlan || lessonPlan;
    console.log('Plan to render:', plan);
    
    if (!plan) {
      console.log('No plan available to render');
      return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <p className="text-gray-700">No lesson plan available.</p>
        </div>
      );
    }

    // Check if the plan has the expected structure from the backend (AI generated or saved AI plan)
    if (plan.learningObjectives || plan.requiredMaterials || plan.activities || 
        plan.assessmentStrategies || plan.homeworkOrFollowUpActivities || 
        plan.factsAndFigures || plan.story || plan.realWorldExamples || 
        plan.practiceExercises || plan.lessonTitle) {
      
      console.log('Rendering AI-structured plan');
      
      return (
        <div className="space-y-6">
          {plan.lessonTitle && (
            <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-r from-blue-50 to-white p-4">
                <h3 className="font-semibold text-xl mb-3 text-blue-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {plan.lessonTitle}
                </h3>
              </div>
            </div>
          )}

          {plan.learningObjectives && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect">
              <div className="bg-gradient-to-r from-blue-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-blue-700 flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Learning Objectives
                </h3>
                {Array.isArray(plan.learningObjectives) ? (
                  <ul className="list-none pl-6 space-y-3">
                    {plan.learningObjectives.map((objective, idx) => (
                      <li key={idx} className="text-gray-700 leading-relaxed flex items-start">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3 flex-shrink-0">{idx + 1}</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{plan.learningObjectives}</p>
                )}
              </div>
            </div>
          )}

          {plan.requiredMaterials && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-green-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.1s'}}>
              <div className="bg-gradient-to-r from-green-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-green-700 flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  Required Materials
                </h3>
                {Array.isArray(plan.requiredMaterials) ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                    {plan.requiredMaterials.map((material, idx) => (
                      <li key={idx} className="text-gray-700 leading-relaxed flex items-center bg-white p-3 rounded-lg shadow-sm border border-green-100">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 mr-3 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span>{material}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-green-100">{plan.requiredMaterials}</p>
                )}
              </div>
            </div>
          )}

          {plan.activities && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-purple-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="bg-gradient-to-r from-purple-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-purple-700 flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Activities Timeline
                </h3>
                {Array.isArray(plan.activities) ? (
                  <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-200">
                    {plan.activities.map((activity, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm relative animate-fadeIn" style={{animationDelay: `${0.1 * (idx + 1)}s`}}>
                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-purple-500 border-4 border-purple-100 z-10"></div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-purple-800 text-lg">{typeof activity === 'object' ? activity.title || `Activity ${idx + 1}` : `Activity ${idx + 1}`}</h4>
                          {typeof activity === 'object' && activity.duration && (
                            <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {String(activity.duration)}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{typeof activity === 'object' ? activity.description || activity.content || JSON.stringify(activity) : String(activity)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-purple-100">{typeof plan.activities === 'object' ? JSON.stringify(plan.activities) : String(plan.activities)}</p>
                )}
              </div>
            </div>
          )}
     {plan.assessmentStrategies && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-amber-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.3s'}}>
              <div className="bg-gradient-to-r from-amber-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-amber-700 flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  Assessment Strategies
                </h3>
                {Array.isArray(plan.assessmentStrategies) ? (
                  <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
                    <ul className="space-y-3">
                      {plan.assessmentStrategies.map((item, idx) => (
                        <li key={idx} className="text-gray-700 leading-relaxed flex items-start animate-fadeIn" style={{animationDelay: `${0.1 * (idx + 1)}s`}}>
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-amber-100">{plan.assessmentStrategies}</p>
                )}
              </div>
            </div>
          )}

          {plan.homeworkOrFollowUpActivities && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-red-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.4s'}}>
              <div className="bg-gradient-to-r from-red-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-red-700 flex items-center">
                  <div className="bg-red-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  Homework/Follow-up Activities
                </h3>
                {Array.isArray(plan.homeworkOrFollowUpActivities) ? (
                  <div className="grid grid-cols-1 gap-3">
                    {plan.homeworkOrFollowUpActivities.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm animate-fadeIn" style={{animationDelay: `${0.1 * (idx + 1)}s`}}>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-red-100">{plan.homeworkOrFollowUpActivities}</p>
                )}
              </div>
            </div>
          )}

          {plan.factsAndFigures && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-yellow-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.5s'}}>
              <div className="bg-gradient-to-r from-yellow-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-yellow-700 flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Key Facts and Figures
                </h3>
                {Array.isArray(plan.factsAndFigures) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.factsAndFigures.map((fact, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-yellow-100 shadow-sm animate-fadeIn" style={{animationDelay: `${0.1 * (idx + 1)}s`}}>
                        <div className="flex items-center mb-2">
                          <div className="flex-shrink-0 bg-yellow-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                            <span className="font-bold text-yellow-700">{idx + 1}</span>
                          </div>
                          <h4 className="font-medium text-yellow-800">Fact {idx + 1}</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed pl-11">{fact}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-yellow-100">{plan.factsAndFigures}</p>
                )}
              </div>
            </div>
          )}

          {plan.story && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-indigo-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.6s'}}>
              <div className="bg-gradient-to-r from-indigo-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-indigo-700 flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  Engaging Story/Narrative
                </h3>
                <div className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
                  {typeof plan.story === 'object' ? (
                    <div className="animate-fadeIn">
                      {plan.story.title && (
                        <h4 className="font-semibold text-indigo-800 text-xl mb-4 border-b border-indigo-100 pb-2">{plan.story.title}</h4>
                      )}
                      {plan.story.plot && Array.isArray(plan.story.plot) ? (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-200 shadow-inner">
                            <h5 className="font-medium text-indigo-700 mb-3 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span>कहानी</span>
                              <span className="ml-2 text-sm text-indigo-500">(Story)</span>
                            </h5>
                            <div className="relative">
                              <div className="absolute top-0 bottom-0 left-7 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300"></div>
                              <div className="space-y-4 pl-10">
                                {plan.story.plot.map((paragraph, idx) => (
                                  <div key={idx} className="relative animate-fadeIn" style={{animationDelay: `${0.1 * (idx + 1)}s`}}>
                                    <div className="absolute -left-10 top-0 w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                                      {idx + 1}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed italic">{paragraph}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : plan.story.example && plan.story.application ? (
                        <div className="space-y-4">
                          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200 shadow-inner">
                            <h5 className="font-medium text-indigo-700 mb-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span>कहानी</span>
                              <span className="ml-2 text-sm text-indigo-500">(Story)</span>
                            </h5>
                            <p className="text-gray-700 leading-relaxed italic pl-7">{plan.story.example}</p>
                          </div>
                          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-200 shadow-inner">
                            <h5 className="font-medium text-indigo-700 mb-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span>नैतिक शिक्षा</span>
                              <span className="ml-2 text-sm text-indigo-500">(Moral)</span>
                            </h5>
                            <p className="text-gray-700 leading-relaxed italic pl-7">{plan.story.application}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed italic bg-indigo-50 p-5 rounded-lg border border-indigo-200 shadow-inner">
                          {plan.story.narrative || plan.story.content || 
                           (typeof plan.story === 'object' ? JSON.stringify(plan.story) : String(plan.story))}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed italic">{String(plan.story)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {plan.realWorldExamples && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-orange-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.7s'}}>
              <div className="bg-gradient-to-r from-orange-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-orange-700 flex items-center">
                  <div className="bg-orange-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Real-World Examples
                </h3>
                {Array.isArray(plan.realWorldExamples) ? (
                  <div className="space-y-6">
                    {plan.realWorldExamples.map((example, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-lg border border-orange-100 shadow-sm animate-fadeIn" style={{animationDelay: `${0.1 * (idx + 1)}s`}}>
                        {typeof example === 'object' ? (
                          <div>
                            {example.title && (
                              <h4 className="font-semibold text-orange-800 text-lg mb-3 border-b border-orange-100 pb-2">{example.title}</h4>
                            )}
                            {example.example && example.application ? (
                              <div className="space-y-4">
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-inner">
                                  <h5 className="font-medium text-orange-700 mb-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Example:
                                  </h5>
                                  <p className="text-gray-700 leading-relaxed pl-7">{example.example}</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-inner">
                                  <h5 className="font-medium text-orange-700 mb-2 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Practical Application:
                                  </h5>
                                  <p className="text-gray-700 leading-relaxed pl-7">{example.application}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-orange-50 p-4 rounded-lg shadow-inner space-y-4">
                                {/* Display all properties of the example object in a structured way */}
                                {Object.entries(example).map(([key, value], i) => (
                                  <div key={i} className="border-b border-orange-100 pb-3 last:border-b-0 last:pb-0">
                                    <h5 className="font-medium text-orange-700 mb-2 capitalize">{key}:</h5>
                                    <p className="text-gray-700 leading-relaxed pl-4">
                                      {typeof value === 'object' ? 
                                        Object.entries(value).map(([subKey, subValue], j) => (
                                          <div key={j} className="mb-2 last:mb-0">
                                            <span className="font-medium capitalize">{subKey}: </span>
                                            <span>{typeof subValue === 'object' ? JSON.stringify(subValue) : String(subValue)}</span>
                                          </div>
                                        ))
                                        : String(value)
                                      }
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-700 leading-relaxed">{String(example)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-orange-50 p-5 rounded-lg border border-orange-200 shadow-inner">
                    {typeof plan.realWorldExamples === 'object' ? (
                      <div className="space-y-4">
                        {Object.entries(plan.realWorldExamples).map(([key, value], idx) => (
                          <div key={idx} className="border-b border-orange-100 pb-3 last:border-b-0 last:pb-0">
                            <h5 className="font-medium text-orange-700 mb-2 capitalize">{key}:</h5>
                            <div className="text-gray-700 leading-relaxed pl-4">
                              {typeof value === 'object' ? 
                                Object.entries(value).map(([subKey, subValue], j) => (
                                  <div key={j} className="mb-2 last:mb-0">
                                    <span className="font-medium capitalize">{subKey}: </span>
                                    <span>{typeof subValue === 'object' ? JSON.stringify(subValue) : String(subValue)}</span>
                                  </div>
                                ))
                                : String(value)
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{String(plan.realWorldExamples)}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {plan.practiceExercises && (
            <div className="bg-white rounded-xl shadow-md border-l-4 border-teal-500 overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: '0.8s'}}>
              <div className="bg-gradient-to-r from-teal-50 to-white p-5">
                <h3 className="font-bold text-lg mb-4 text-teal-700 flex items-center">
                  <div className="bg-teal-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  Practice Exercises
                </h3>
                {Array.isArray(plan.practiceExercises) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {plan.practiceExercises.map((exercise, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-lg border border-teal-100 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeIn" style={{animationDelay: `${0.1 * (idx + 1)}s`}}>
                        <h4 className="font-semibold mb-3 text-teal-700 flex items-center">
                          <span className="bg-teal-100 text-teal-700 w-7 h-7 rounded-full flex items-center justify-center mr-3 text-sm font-bold shadow-inner">{idx + 1}</span>
                          Exercise
                        </h4>
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 shadow-inner">
                          <p className="text-gray-700 leading-relaxed">{typeof exercise === 'object' ? exercise.description || exercise.content : exercise}</p>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-700 font-medium py-1 px-3 rounded-full transition-colors duration-200 animate-pulse-slow flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Try Exercise
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed bg-teal-50 p-4 rounded-lg shadow-inner">{plan.practiceExercises}</p>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Default rendering for locally generated lesson plans
    return (
      <div className="space-y-6">
        {lessonPlan.sections && lessonPlan.sections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md border-l-4 border-primary overflow-hidden transition-all duration-300 hover:shadow-lg hover-card-effect animate-fadeIn" style={{animationDelay: `${0.1 * (index + 1)}s`}}>
            <div className="bg-gradient-to-r from-primary-50 to-white p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-primary-700 flex items-center">
                  <div className="bg-primary-100 p-2 rounded-full mr-3 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  {section.title}
                </h3>
                <span className="text-sm bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full font-medium shadow-inner animate-pulse-slow">{section.duration}</span>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 shadow-inner">
                <p className="text-gray-700 leading-relaxed">{section.content}</p>
              </div>
            </div>
          </div>
        ))}
        {!lessonPlan.sections && (
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 animate-fadeIn">
            <div className="flex items-center justify-center p-6 text-center">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">No lesson plan sections available.</p>
                <p className="text-gray-500 text-sm mt-2">Create a new lesson plan to get started.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 relative inline-block">
          <span className="relative z-10">Lesson Planning</span>
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary opacity-20 rounded"></span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Create engaging and effective lesson plans with AI assistance</p>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow-md flex items-center animate-fadeIn">
          <div className="bg-red-100 p-2 rounded-full mr-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {saveSuccess && (
        <div className="mb-6 p-5 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-xl shadow-md flex items-center animate-fadeIn">
          <div className="bg-green-100 p-2 rounded-full mr-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Success</h4>
            <p>{saveSuccessMessage}</p>
          </div>
        </div>
      )}
      
      {/* Loading Indicator for AI Generation */}
      {generatingPlan && (
        <div className="mb-6 p-5 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-xl shadow-md flex items-center animate-fadeIn">
          <div className="bg-blue-100 p-2 rounded-full mr-4 shadow-inner flex-shrink-0">
            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Generating</h4>
            <p>Creating your lesson plan with AI... This may take a moment.</p>
          </div>
        </div>
      )}
      
      {!showLessonPlan ? (
        <div className={`transition-opacity duration-500 ${animateCards ? 'opacity-100' : 'opacity-0'}`}>
          {/* Tabs for Templates and Saved Plans */}
          <div className="flex justify-center border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-3 px-6 font-medium border-b-2 transition-all duration-300 ${activeTab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Plan
              </div>
            </button>
            <button
              onClick={() => savedPlans.length > 0 && setActiveTab('saved')}
              className={`py-3 px-6 font-medium border-b-2 transition-all duration-300 ${activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              disabled={!savedPlans.length}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Saved Plans ({savedPlans.length})
              </div>
            </button>
          </div>
          
          {activeTab === 'templates' ? (
            /* Templates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessonTemplates.map((template, index) => (
                <div 
                  key={template.id}
                  className={`p-6 rounded-xl shadow-lg border-2 ${template.color} cursor-pointer transform transition-all duration-500 hover:shadow-2xl hover:scale-105 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  onClick={() => handleCardClick(template.id)}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white bg-opacity-50 text-4xl shadow-inner">{template.icon}</div>
                  <h3 className="text-lg font-bold mb-3 text-gray-800">{template.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{template.description}</p>
                  <div className="mt-4 flex justify-end">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-white bg-opacity-50 text-gray-700 hover:bg-opacity-70 transition-colors">
                      Select
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Saved Plans Grid */
            <div>
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading saved plans...</p>
                </div>
              ) : savedPlans.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No saved plans yet. Create your first lesson plan!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {console.log('Rendering savedPlans:', savedPlans)}
                  {savedPlans.map((plan, index) => {
                    console.log(`Rendering plan ${index}:`, plan);
                    // Check if plan has required properties
                    const hasRequiredProps = plan && plan.topicName && plan.templateId;
                    console.log(`Plan ${index} has required props:`, hasRequiredProps);
                    
                    // If plan doesn't have required properties, render a debug card
                    if (!hasRequiredProps) {
                      return (
                        <div key={index} className="p-6 rounded-xl shadow-lg border-l-4 border-red-500 bg-white">
                          <h3 className="text-lg font-bold mb-3 text-red-800">Invalid Plan Data</h3>
                          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                            {JSON.stringify(plan, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                    
                    return (
                      <div 
                        key={plan.id || index}
                        className={`p-6 rounded-xl shadow-lg border-l-4 border-primary bg-white cursor-pointer transform transition-all duration-500 hover:shadow-2xl hover:scale-105 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                        onClick={() => {
                          console.log('Clicked on plan:', plan);
                          // Load saved plan
                          setSelectedCard(plan.templateId);
                          setTopicName(plan.topicName);
                          setDuration(plan.duration);
                          setLanguage(plan.language || 'english');
                          
                          // For all saved plans, set them as generatedLessonPlan to ensure proper rendering
                          console.log('Setting generatedLessonPlan:', plan);
                          setGeneratedLessonPlan(plan);
                          
                          // Also update the lessonPlan state as a fallback
                          if (plan.sections) {
                            // If it has sections (locally generated plan structure)
                            const localPlan = {
                              title: plan.title || plan.lessonTitle || `${plan.topicName} Lesson Plan`,
                              sections: plan.sections
                            };
                            console.log('Setting local lessonPlan:', localPlan);
                          }
                          
                          setShowLessonPlan(true);
                        }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary bg-opacity-10 text-3xl shadow-inner">
                            {lessonTemplates.find(t => t.id === plan.templateId)?.icon || '📄'}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                deleteLessonPlan(plan.id);
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                              title="Delete lesson plan"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'No date'}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-3 text-gray-800">{plan.title || plan.lessonTitle || 'Untitled Plan'}</h3>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-sm text-gray-600">{plan.topicName}</span>
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-primary bg-opacity-10 text-primary hover:bg-opacity-20 transition-colors">
                            Open
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 transition-all duration-500 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-100">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{lessonPlan.title}</h2>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-600">Duration: <span className="text-primary font-semibold">{lessonPlan.duration}</span></span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={saveLessonPlan}
                disabled={loading}
                className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Plan
                  </>
                )}
              </button>
              <button 
                onClick={handleBack}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to Templates
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {renderLessonPlanContent()}
          </div>
          
          <div className="mt-10 p-5 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200 shadow-inner">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-blue-800 mb-2">Teacher Notes</h3>
                <p className="text-gray-700 leading-relaxed">This lesson plan is a template. Feel free to adjust timing and activities based on your students' needs and classroom dynamics.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal for topic and duration */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-3">
                {lessonTemplates.find(t => t.id === selectedCard)?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {lessonTemplates.find(t => t.id === selectedCard)?.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {lessonTemplates.find(t => t.id === selectedCard)?.description}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium" htmlFor="topic">
                  Topic Name
                </label>
                <input
                  id="topic"
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-black"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g., Photosynthesis, World War II"
                  required
                />
                <p className="text-xs text-gray-500">Enter the specific topic for your lesson plan</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium" htmlFor="duration">
                  Lesson Duration (minutes)
                </label>
                <input
                  id="duration"
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-black"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 45, 60, 90"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500">How long will this lesson take?</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium" htmlFor="language">
                  Language
                </label>
                <select
                  id="language"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none appearance-none bg-white text-black"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')" ,
                           backgroundRepeat: 'no-repeat',
                           backgroundPosition: 'right 10px center',
                           paddingRight: '30px' }}
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="gujarati">Gujarati</option>
                </select>
                <p className="text-xs text-gray-500">Select the language for your lesson plan</p>
              </div>
              
              <div className="space-y-1">
                <label className="block text-gray-700 font-medium" htmlFor="standard">
                  Student Standard (Grade Level)
                </label>
                <select
                  id="standard"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none appearance-none bg-white text-black"
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')" ,
                           backgroundRepeat: 'no-repeat',
                           backgroundPosition: 'right 10px center',
                           paddingRight: '30px' }}
                >
                  <option value="1-5">Grades 1-5 (Elementary)</option>
                  <option value="6-8">Grades 6-8 (Middle School)</option>
                  <option value="9+">Grades 9+ (High School)</option>
                </select>
                <p className="text-xs text-gray-500">Select the student's grade level for appropriate content</p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
                  onClick={() => setShowModal(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium flex items-center shadow-md hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Create Lesson Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanning;