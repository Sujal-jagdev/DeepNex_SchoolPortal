const supabase = require("../Supabase/supabaseServer");

// Authentication functions
exports.signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

exports.signIn = async (email, password) => {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

exports.signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

exports.resetPassword = async (email, redirectUrl) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  return { data, error };
};

exports.updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

exports.getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

exports.updateUserMetadata = async (metadata) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });
  return { data, error };
};

// User data functions
exports.insertUserData = async (table, userData) => {
  try {
    console.log(`Attempting to insert into ${table}:`, userData);
    
    // First verify the table exists
    const { data: tableExists, error: tableError } = await supabase
      .rpc('table_exists', { table_name: table });
    
    if (tableError || !tableExists) {
      throw new Error(`Table ${table} does not exist or cannot be accessed`);
    }

    // Perform the insert
    const { data, error } = await supabase
      .from(table)
      .insert([userData])
      .select();
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Insert successful:', data);
    return { data, error: null };
    
  } catch (err) {
    console.error('Full error stack:', err);
    return { 
      data: null, 
      error: {
        message: err.message,
        code: err.code || 'UNKNOWN_ERROR',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    };
  }
};

exports.getUserData = async (table, userId) => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

exports.updateUserData = async (table, userId, updates) => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', userId);
  return { data, error };
};

exports.deleteUserData = async (table, userId) => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', userId);
  return { data, error };
};

// Google Sign-In
exports.signInWithGoogle = async (redirectUrl) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
  return { data, error };
};

// Verify security PIN (for HOD and Admin)
exports.verifySecurityPin = async (role, pin) => {
  // In a real app, you would verify this against a secure backend
  // For now, we'll just simulate a verification
  const { data, error } = await supabase.rpc('verify_security_pin', {
    role_type: role,
    security_pin: pin,
  });
  return { data, error };
};

// HOD related functions
exports.getHODs = async (department) => {
  try {
    let query = supabase.from('hod').select("*");

    if (department) {
      query = query.eq('department', department);
    }
    
    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    console.log(error)
    return { data: null, error };
  }
};


exports.updateHOD = async (id, updateData) => {
  try {
    // First verify this is actually an HOD
    const { data: existingHod, error: fetchError } = await supabase
      .from('hod')
      .select('role')
      .eq('id', id)
      .single();

    if (fetchError || !existingHod || existingHod.role !== 'HOD') {
      return { data: null, error: fetchError || { message: "HOD not found with this ID" } };
    }

    // Now perform the update
    const { data, error } = await supabase
      .from('hod')
      .update(updateData) 
      .eq('id', id)
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.deleteHOD = async (id) => {
  try {
    // First verify this is actually an HOD
    const { data: existingHod, error: fetchError } = await supabase
      .from('hod')
      .select('role')
      .eq('id', id)
      .single();

    if (fetchError || !existingHod || existingHod.role !== 'HOD') {
      return { error: fetchError || { message: "HOD not found with this ID" } };
    }

    // Now perform the deletion
    const { error } = await supabase
      .from('hod')
      .delete()
      .eq('id', id);

      const { data, error: authError } = await supabase.auth.admin.deleteUser(id)
      console.log(data)
    return { error,authError };
  } catch (error) {
    return { error };
  }
};

// Student related functions
exports.getStudents = async (std) => {
  try {
    let query = supabase.from('student').select('*');

    if (std) {
      query = query.eq('std', std);
    }
    
    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.updateStudent = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('student')
      .update(updateData)
      .eq('id', id)
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.deleteStudent = async (id) => {
  try {
    const { error } = await supabase
      .from('student')
      .delete()
      .eq('id', id);

      const { data, error: authError } = await supabase.auth.admin.deleteUser(id)
      console.log(data)

    return { error,authError };
  } catch (error) {
    return { error };
  }
};

// Teacher related functions
exports.getTeachers = async (subjectExpertise) => {
  try {
    let query = supabase.from('teacher').select('*');

    if (subjectExpertise) {
      query = query.eq('subject_expertise', subjectExpertise);
    }
    
    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.updateTeacher = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('teacher')
      .update(updateData)
      .eq('id', id)
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.deleteTeacher = async (id) => {
  try {
    const { error } = await supabase
      .from('teacher')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Admin related functions
exports.getAdmins = async () => {
  try {
    const { data, error } = await supabase.from('admin').select('*');
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.updateAdmin = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('admin')
      .update(updateData)
      .eq('id', id)
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.deleteAdmin = async (id) => {
  try {
    const { error } = await supabase
      .from('admin')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Teacher approvals related functions
exports.getTeacherApprovals = async (status) => {
  try {
    let query = supabase.from('teacher_approvals').select('*');

    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.updateTeacherApproval = async (id, updateData) => {
  try {
    const { data, error } = await supabase
      .from('teacher_approvals')
      .update(updateData)
      .eq('id', id)
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.deleteTeacherApproval = async (id) => {
  try {
    const { error } = await supabase
      .from('teacher_approvals')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Department related functions
exports.getDepartments = async () => {
  try {
    // Fetch unique departments from the database
    const { data, error } = await supabase
      .from('hod')
      .select('department_expertise')
      .not('department_expertise', 'is', null);

    if (error) {
      return { data: null, error };
    }

    // Extract unique departments
    const departments = [...new Set(data.map(item => item.department_expertise).filter(Boolean))];
    return { data: departments, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Chat session related functions
exports.createChatSession = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([userData])
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.getChatSessions = async (userId) => {
  try {
    let query = supabase.from('sessions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.deleteChatSession = async (sessionId) => {
  try {
    // First delete all chat messages associated with this session
    const { error: chatHistoryError } = await supabase
      .from('chatHistory')
      .delete()
      .eq('session_id', sessionId);

    if (chatHistoryError) {
      return { error: chatHistoryError };
    }

    // Then delete the session itself
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Chat history related functions
exports.saveChatMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('chatHistory')
      .insert([messageData])
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.getChatHistory = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('chatHistory')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

exports.clearChatHistory = async (sessionId) => {
  try {
    const { error } = await supabase
      .from('chatHistory')
      .delete()
      .eq('session_id', sessionId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Lesson Plan related functions
exports.saveLessonPlan = async (lessonPlanData) => {
  try {
    // First create a session for this lesson plan
    const newSessionData = {  // Changed variable name to avoid conflict
      user_id: lessonPlanData.teacherId,
      session_title: `Lesson Plan: ${lessonPlanData.title}`
    };
    
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert([newSessionData])  // Using the renamed variable here
      .select();
      
    if (sessionError) {
      console.error('Error creating session for lesson plan:', sessionError);
      return { data: null, error: sessionError };
    }
    
    // Get the session ID
    const sessionId = sessionData[0].id;
    
    // Save the lesson plan content as a chat message
    const messageData = {
      session_id: sessionId,
      sender_role: 'teacher',
      content: JSON.stringify(lessonPlanData),
      response_to: null
    };
    
    const { data, error } = await supabase
      .from('chatHistory')
      .insert([messageData])
      .select();
      
    if (error) {
      console.error('Error saving lesson plan to chatHistory:', error);
      // Try to clean up the session if message saving fails
      await supabase.from('sessions').delete().eq('id', sessionId);
      return { data: null, error };
    }
    
    // Return both session and message data
    return { 
      data: { 
        session: sessionData[0], 
        message: data[0],
        lessonPlan: lessonPlanData
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error saving lesson plan to Supabase:', error);
    return { data: null, error };
  }
};

exports.getTeacherLessonPlans = async (teacherId) => {
  try {
    // First get all sessions for this teacher that are lesson plans
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', teacherId)
      .like('session_title', 'Lesson Plan:%')
      .order('created_at', { ascending: false });
      
    if (sessionsError) {
      console.error('Error fetching lesson plan sessions:', sessionsError);
      return { data: null, error: sessionsError };
    }
    
    if (!sessions || sessions.length === 0) {
      return { data: [], error: null };
    }
    
    // Get all lesson plan content from chatHistory
    const sessionIds = sessions.map(session => session.id);
    const { data: messages, error: messagesError } = await supabase
      .from('chatHistory')
      .select('*')
      .in('session_id', sessionIds)
      .eq('sender_role', 'teacher')
      .order('created_at', { ascending: false });
      
    if (messagesError) {
      console.error('Error fetching lesson plan messages:', messagesError);
      return { data: null, error: messagesError };
    }
    
    // Parse the lesson plans from the messages
    const lessonPlans = messages.map(message => {
      try {
        const lessonPlanData = JSON.parse(message.content);
        return {
          ...lessonPlanData,
          id: message.id,
          sessionId: message.session_id,
          createdAt: message.created_at
        };
      } catch (e) {
        console.error('Error parsing lesson plan data:', e);
        return null;
      }
    }).filter(plan => plan !== null);
    
    return { data: lessonPlans, error: null };
  } catch (error) {
    console.error('Error fetching lesson plans from Supabase:', error);
    return { data: null, error };
  }
};

exports.getLessonPlanById = async (planId) => {
  try {
    // Get the message containing the lesson plan
    const { data: message, error: messageError } = await supabase
      .from('chatHistory')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (messageError) {
      console.error('Error fetching lesson plan message:', messageError);
      return { data: null, error: messageError };
    }
    
    // Parse the lesson plan data
    try {
      const lessonPlanData = JSON.parse(message.content);
      return { 
        data: {
          ...lessonPlanData,
          id: message.id,
          sessionId: message.session_id,
          createdAt: message.created_at
        }, 
        error: null 
      };
    } catch (e) {
      console.error('Error parsing lesson plan data:', e);
      return { data: null, error: e };
    }
  } catch (error) {
    console.error('Error fetching lesson plan from Supabase:', error);
    return { data: null, error };
  }
};

exports.updateLessonPlan = async (planId, updates) => {
  try {
    // First get the current message
    const { data: message, error: messageError } = await supabase
      .from('chatHistory')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (messageError) {
      console.error('Error fetching lesson plan message for update:', messageError);
      return { data: null, error: messageError };
    }
    
    // Parse the current content, update it, and stringify it again
    try {
      const currentContent = JSON.parse(message.content);
      const updatedContent = { ...currentContent, ...updates };
      
      // Update the message with the new content
      const { data, error } = await supabase
        .from('chatHistory')
        .update({ content: JSON.stringify(updatedContent) })
        .eq('id', planId)
        .select();
        
      if (error) {
        console.error('Error updating lesson plan message:', error);
        return { data: null, error };
      }
      
      // Parse and return the updated lesson plan
      const updatedLessonPlan = JSON.parse(data[0].content);
      return { 
        data: {
          ...updatedLessonPlan,
          id: data[0].id,
          sessionId: data[0].session_id,
          createdAt: data[0].created_at
        }, 
        error: null 
      };
    } catch (e) {
      console.error('Error parsing or updating lesson plan data:', e);
      return { data: null, error: e };
    }
  } catch (error) {
    console.error('Error updating lesson plan in Supabase:', error);
    return { data: null, error };
  }
};

exports.deleteLessonPlan = async (planId) => {
  try {
    // First get the message to find its session
    const { data: message, error: messageError } = await supabase
      .from('chatHistory')
      .select('session_id')
      .eq('id', planId)
      .single();
      
    if (messageError) {
      console.error('Error fetching lesson plan message for deletion:', messageError);
      return { error: messageError };
    }
    
    const sessionId = message.session_id;
    
    // Delete the message
    const { error: deleteMessageError } = await supabase
      .from('chatHistory')
      .delete()
      .eq('id', planId);
      
    if (deleteMessageError) {
      console.error('Error deleting lesson plan message:', deleteMessageError);
      return { error: deleteMessageError };
    }
    
    // Delete the session
    const { error: deleteSessionError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
      
    if (deleteSessionError) {
      console.error('Error deleting lesson plan session:', deleteSessionError);
      return { error: deleteSessionError };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting lesson plan from Supabase:', error);
    return { error };
  }
};
