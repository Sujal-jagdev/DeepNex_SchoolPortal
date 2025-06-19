const axios = require('axios');
const supabaseModel = require('../Models/supabaseModel');

/**
 * Translates common lesson plan field names from English to Hindi
 * @param {Object} lessonPlan - The lesson plan object with English field names
 * @param {Boolean} isHindi - Whether to translate to Hindi
 * @returns {Object} - The lesson plan object with Hindi field names where applicable
 */
const translateLessonPlanFields = (lessonPlan, isHindi) => {
  if (!isHindi || !lessonPlan) return lessonPlan;
  
  // Create a deep copy to avoid modifying the original object
  const translatedPlan = JSON.parse(JSON.stringify(lessonPlan));
  
  // Translation mapping for common field names
  const fieldTranslations = {
    'title': 'शीर्षक',
    'learningObjectives': 'शिक्षण उद्देश्य',
    'requiredMaterials': 'आवश्यक सामग्री',
    'activities': 'गतिविधियाँ',
    'assessmentStrategies': 'मूल्यांकन रणनीतियाँ',
    'homework': 'गृहकार्य',
    'factsAndFigures': 'तथ्य और आंकड़े',
    'story': 'कहानी',
    'realWorldExamples': 'वास्तविक दुनिया के उदाहरण',
    'practiceExercises': 'अभ्यास',
    'duration': 'अवधि',
    'topic': 'विषय',
    'grade': 'कक्षा',
    'subject': 'विषय',
    'introduction': 'परिचय',
    'conclusion': 'निष्कर्ष',
    'followUpActivities': 'अनुवर्ती गतिविधियाँ'
  };
  
  // Translate top-level fields
  for (const [engField, hindiField] of Object.entries(fieldTranslations)) {
    if (translatedPlan[engField] !== undefined) {
      translatedPlan[hindiField] = translatedPlan[engField];
      // Keep both versions to maintain compatibility
    }
  }
  
  return translatedPlan;
};

/**
 * Create a new lesson plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createLessonPlan = async (req, res) => {
  try {
    const newPlan = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const { data, error } = await supabaseModel.saveLessonPlan(newPlan);
    
    if (error) {
      throw new Error(error.message || 'Failed to save lesson plan');
    }
    
    res.status(201).json({
      success: true,
      lessonPlan: data.lessonPlan,
      message: "Lesson plan created successfully"
    });
  } catch (error) {
    console.error('Error creating lesson plan:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create lesson plan",
      error: error.message
    });
  }
};

/**
 * Get all lesson plans for a teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTeacherLessonPlans = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { data, error } = await supabaseModel.getTeacherLessonPlans(teacherId);
    
    if (error) {
      throw new Error(error.message || 'Failed to fetch lesson plans');
    }
    
    res.json({
      success: true,
      lessonPlans: data,
      message: "Lesson plans retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching lesson plans:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lesson plans",
      error: error.message
    });
  }
};

/**
 * Get a specific lesson plan by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLessonPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    const { data, error } = await supabaseModel.getLessonPlanById(planId);
    
    if (error) {
      throw new Error(error.message || 'Failed to fetch lesson plan');
    }
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Lesson plan not found"
      });
    }
    
    res.json({
      success: true,
      lessonPlan: data,
      message: "Lesson plan retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching lesson plan:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lesson plan",
      error: error.message
    });
  }
};

/**
 * Update a lesson plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateLessonPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const { data, error } = await supabaseModel.updateLessonPlan(planId, updates);
    
    if (error) {
      throw new Error(error.message || 'Failed to update lesson plan');
    }
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Lesson plan not found"
      });
    }
    
    res.json({
      success: true,
      lessonPlan: data,
      message: "Lesson plan updated successfully"
    });
  } catch (error) {
    console.error('Error updating lesson plan:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson plan",
      error: error.message
    });
  }
};

/**
 * Delete a lesson plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteLessonPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { error } = await supabaseModel.deleteLessonPlan(planId);
    
    if (error) {
      // Check if the error is because the plan wasn't found
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: "Lesson plan not found"
        });
      }
      throw new Error(error.message || 'Failed to delete lesson plan');
    }
    
    res.json({
      success: true,
      message: "Lesson plan deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting lesson plan:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lesson plan",
      error: error.message
    });
  }
};

/**
 * Generate a lesson plan using Mistral AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateLessonPlan = async (req, res) => {
  try {
    const { templateType, topicName, duration, language, standard } = req.body;
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
    
    if (!templateType || !topicName || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: templateType, topicName, or duration'
      });
    }
    
    // Construct a prompt based on the template type and user's request for more detail
    let prompt = `Generate a detailed lesson plan for a ${duration}-minute lesson on "${topicName}" using the "${templateType}" teaching approach. `;
    
    // Add language preference if specified
    if (language && language !== 'English') {
      prompt += `Please generate the lesson plan in ${language}. `;
    }
    
    // Add standard-specific instructions
    if (standard) {
      // Convert standard to number if it's a string
      const standardNum = typeof standard === 'string' ? parseInt(standard, 10) : standard;
      
      if (standardNum >= 1 && standardNum <= 5) {
        // For younger students (grades 1-5)
        prompt += 'This lesson plan is for younger students (grades 1-5). ';
        prompt += 'Please ensure the content is: ';
        prompt += '1. Simple and easy to understand with basic vocabulary, ';
        prompt += '2. Highly visual and interactive, ';
        prompt += '3. Includes short, engaging stories with colorful characters, ';
        prompt += '4. Uses playful activities and games for learning, ';
        prompt += '5. Breaks down complex concepts into very simple parts, ';
        prompt += '6. Incorporates songs, rhymes, or movement activities where appropriate. ';
        prompt += 'The storytelling element should be brief, colorful, and have a clear moral or learning point. ';
      } else if (standardNum >= 6 && standardNum <= 8) {
        // For middle school students (grades 6-8)
        prompt += 'This lesson plan is for middle school students (grades 6-8). ';
        prompt += 'Please ensure the content is: ';
        prompt += '1. Moderately challenging with age-appropriate vocabulary, ';
        prompt += '2. Includes interactive discussions and group activities, ';
        prompt += '3. Features relatable stories with more developed characters and plots, ';
        prompt += '4. Incorporates problem-solving and critical thinking exercises, ';
        prompt += '5. Makes connections to students\'s daily lives and experiences. ';
        prompt += 'The storytelling element should be engaging, have multiple phases, and encourage students to think about cause and effect. ';
      } else if (standardNum >= 9) {
        // For high school students (grades 9+)
        prompt += 'This lesson plan is for high school students (grades 9+). ';
        prompt += 'Please ensure the content is: ';
        prompt += '1. Academically rigorous with advanced vocabulary and concepts, ';
        prompt += '2. Includes deep analytical discussions and independent research components, ';
        prompt += '3. Features complex, multi-faceted stories or case studies, ';
        prompt += '4. Incorporates higher-order thinking skills and abstract reasoning, ';
        prompt += '5. Makes connections to broader societal issues and global contexts. ';
        prompt += 'The storytelling element should be sophisticated, have three distinct phases (beginning, middle, end), and encourage students to analyze themes and implications. ';
      }
    }
    
    prompt += 'Make the lesson plan engaging by incorporating the following elements: ';
    prompt += '1. Facts and figures: Include 3-5 relevant statistics, data points, or interesting facts about the topic. ';
    prompt += '2. Storytelling: Include a short, engaging narrative or anecdote related to the topic that captures student interest. ';
    prompt += '3. Real-world examples: Provide 2-3 concrete, relatable examples showing how the topic applies in real-life situations. ';
    prompt += '4. Practice exercises: Include 2-3 hands-on activities or exercises for students to apply what they have learned. ';
    // Check if Hindi language is requested
    const isHindi = req.headers['accept-language'] && req.headers['accept-language'].includes('hi');
    
    if (isHindi && (language === 'Hindi' || !language)) {
      prompt += 'पाठ योजना में निम्नलिखित अनुभाग शामिल होने चाहिए: ';
      prompt += '1. शिक्षण उद्देश्य (3-5 विशिष्ट, मापने योग्य लक्ष्य), ';
      prompt += '2. आवश्यक सामग्री (सभी आवश्यक वस्तुओं की सूची), ';
      prompt += '3. समय आवंटन के साथ गतिविधियों का विवरण (सुनिश्चित करें कि वे कुल अवधि के भीतर फिट हों), ';
      prompt += '4. मूल्यांकन रणनीतियाँ (आप छात्र की समझ को कैसे मापेंगे), ';
      prompt += '5. गृहकार्य या अनुवर्ती गतिविधियाँ. ';
      prompt += 'इन अनुभागों के साथ एक संरचित JSON ऑब्जेक्ट के रूप में प्रतिक्रिया को फॉर्मेट करें, जिसमें अतिरिक्त तत्व (तथ्य और आंकड़े, कहानी, वास्तविक दुनिया के उदाहरण, अभ्यास) शामिल हों। ';
      prompt += 'कृपया JSON फील्ड नामों को हिंदी में रखें, जैसे "शिक्षण उद्देश्य" (learningObjectives के लिए), "आवश्यक सामग्री" (requiredMaterials के लिए), आदि।';
    } else {
      prompt += 'The lesson plan should include the following sections: ';
      prompt += '1. Learning objectives (3-5 specific, measurable goals), ';
      prompt += '2. Required materials (list all necessary items), ';
      prompt += '3. A breakdown of activities with time allocations (ensure they fit within the total duration), ';
      prompt += '4. Assessment strategies (how you will measure student understanding), ';
      prompt += '5. Homework or follow-up activities. ';
      prompt += 'Format the response as a structured JSON object with these sections, including the additional elements (factsAndFigures, story, realWorldExamples, practiceExercises).';
    }
    
    // Call Mistral API
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are an expert educational consultant specializing in curriculum development and lesson planning. You create engaging, well-structured lesson plans that incorporate facts and figures, storytelling elements, real-world examples, and practical exercises to maximize student engagement and learning outcomes.' },
          { role: 'user', content: prompt }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    const generatedLessonPlan = response.data.choices[0].message.content;
     
    // Clean the response to remove markdown code block syntax and extract JSON content
    let cleanedLessonPlan = generatedLessonPlan;
    
    // First, try to extract JSON from markdown code blocks
    if (generatedLessonPlan.includes('```json')) {
      const jsonMatch = generatedLessonPlan.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        cleanedLessonPlan = jsonMatch[1].trim();
      } else {
        cleanedLessonPlan = generatedLessonPlan.replace(/```json\s*|```\s*$/g, '');
      }
    } else {
      // If no code blocks, try to find JSON object in the text
      const jsonStartIndex = generatedLessonPlan.indexOf('{');
      const jsonEndIndex = generatedLessonPlan.lastIndexOf('}');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        cleanedLessonPlan = generatedLessonPlan.substring(jsonStartIndex, jsonEndIndex + 1);
      }
    }
    
    // Validate that the cleaned content is valid JSON
    let parsedLessonPlan;
    try {
      parsedLessonPlan = JSON.parse(cleanedLessonPlan);
      
      // Check if Hindi language is requested
      const isHindi = req.headers['accept-language'] && req.headers['accept-language'].includes('hi');
      
      // Translate field names if Hindi is requested
      const translatedLessonPlan = translateLessonPlanFields(parsedLessonPlan, isHindi);
      
      // Send the parsed and potentially translated JSON object
      res.json({ 
        success: true, 
        lessonPlan: translatedLessonPlan, 
        message: isHindi ? 'पाठ योजना सफलतापूर्वक उत्पन्न की गई' : 'Lesson plan generated successfully' 
      });
    } catch (error) {
      console.warn('Could not parse response as JSON, returning raw content');
      // If not valid JSON, create a simple JSON structure with the content
      parsedLessonPlan = {
        title: 'AI Generated Lesson Plan',
        content: generatedLessonPlan
      };
      
      // Send the fallback JSON object
      const isHindi = req.headers['accept-language'] && req.headers['accept-language'].includes('hi');
      
      // Even for fallback, translate the title if in Hindi
      if (isHindi && parsedLessonPlan.title) {
        parsedLessonPlan.शीर्षक = parsedLessonPlan.title;
      }
      
      res.json({ 
        success: true, 
        lessonPlan: parsedLessonPlan, 
        message: isHindi ? 'पाठ योजना सफलतापूर्वक उत्पन्न की गई' : 'Lesson plan generated successfully' 
      });
    }
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate lesson plan',
      error: error.message 
    });
  }
};