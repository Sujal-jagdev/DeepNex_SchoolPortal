import axios from "axios";

// Base URLs for different servers
const MAIN_API_URL = "http://localhost:5000";
const TEACHER_API_URL = "http://localhost:5000";
const ADMIN_API_URL = "http://localhost:5000";

// Create axios instances for different servers
const mainApi = axios.create({
  baseURL: MAIN_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const teacherApi = axios.create({
  baseURL: TEACHER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token if available
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Add auth interceptors to all API instances
addAuthInterceptor(mainApi);
addAuthInterceptor(teacherApi);
addAuthInterceptor(adminApi);

// Chat API services
export const chatService = {
  sendMessage: async (message, image = null) => {
    const formData = new FormData();
    formData.append("message", message);
    
    // Add userId from localStorage
    const userId = localStorage.getItem("userId");
    if (userId) {
      formData.append("userId", userId);
    }

    if (image) {
      formData.append("image", image);
    }

    const response = await mainApi.post("/api/chat/student", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  sendTeacherMessage: async (message) => {
    const response = await teacherApi.post("/api/chat/teacher", { message });
    return JSON.parse(response.data);
  },

  // Add getChatHistory method
  getChatHistory: async (teacherId) => {
    try {
      const response = await teacherApi.get(`/api/chat/teacher/history`);
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return { success: false, data: [] };
    }
  },

  // Add getStudentInteractions method
  getStudentInteractions: async (teacherId) => {
    try {
      const response = await teacherApi.get(`/api/chat/student/history`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student interactions:", error);
      // Return mock data as fallback
      return {
        success: true,
        data: {
          students: [],
          weeklyActivity: [],
          totalStudents: 0,
          totalMessages: 0,
          activeStudents: 0,
        },
      };
    }
  },
};

// Lesson Planning API services
export const lessonPlanningService = {
  // Save a lesson plan to the database
  saveLessonPlan: async (lessonPlan) => {
    try {
      const response = await mainApi.post("/api/lesson-plans", lessonPlan);
      return response.data;
    } catch (error) {
      console.error("Error saving lesson plan:", error);
      throw error;
    }
  },

  // Get all lesson plans for a teacher
  getTeacherLessonPlans: async (teacherId) => {
    try {
      const response = await teacherApi.get(
        `/api/lesson-plans/teacher/${teacherId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson plans:", error);
      throw error;
    }
  },

  // Get a specific lesson plan by ID
  getLessonPlanById: async (planId) => {
    try {
      const response = await mainApi.get(`/api/lesson-plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson plan:", error);
      throw error;
    }
  },

  // Update an existing lesson plan
  updateLessonPlan: async (planId, updatedPlan) => {
    try {
      const response = await mainApi.put(
        `/api/lesson-plans/${planId}`,
        updatedPlan
      );
      return response.data;
    } catch (error) {
      console.error("Error updating lesson plan:", error);
      throw error;
    }
  },

  // Delete a lesson plan
  deleteLessonPlan: async (planId) => {
    try {
      const response = await mainApi.delete(`/api/lesson-plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting lesson plan:", error);
      throw error;
    }
  },

  // Generate a lesson plan using Mistral AI
  generateLessonPlanWithAI: async (
    templateType,
    topicName,
    duration,
    language = "english",
    standard = "6-8"
  ) => {
    try {
      const response = await teacherApi.post("/api/lesson-plans/generate", {
        templateType,
        topicName,
        duration,
        language,
        standard,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating lesson plan with AI:", error);
      throw error;
    }
  },
};

// User management API services
export const userService = {
  // Get all teachers
  getAllTeachers: async () => {
    try {
      const response = await adminApi.get("/api/trusty/getteachers");
      console.log(response);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      throw error;
    }
  },

  // Get all students
  getAllStudents: async () => {
    try {
      const response = await adminApi.get("/api/trusty/getstudents");
      console.log(response)
      return response.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },

  // Get all HODs
  getAllHODs: async () => {
    try {
      const response = await adminApi.get("/api/trusty/gethods");
      return response.data;
    } catch (error) {
      console.error("Error fetching HODs:", error);
      throw error;
    }
  },

  // Get all departments
  getAllDepartments: async () => {
    try {
      const response = await adminApi.get("/api/trusty/getdepartments");
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },

  // Update teacher
  updateTeacher: async (teacherId, teacherData) => {
    try {
      const response = await adminApi.put(
        `/api/trusty/updateteacher/${teacherId}`,
        teacherData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating teacher:", error);
      throw error;
    }
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await adminApi.put(
        `/api/trusty/updatestudent/${studentId}`,
        studentData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    }
  },

  // Update HOD
  updateHod: async (hodId, hodData) => {
    try {
      const response = await adminApi.put(
        `/api/trusty/updatehod/${hodId}`,
        hodData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating HOD:", error);
      throw error;
    }
  },

  // Delete teacher
  deleteTeacher: async (teacherId) => {
    try {
      const response = await adminApi.delete(
        `/api/trusty/deleteteacher/${teacherId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting teacher:", error);
      throw error;
    }
  },

  // Delete student
  deleteStudent: async (studentId) => {
    try {
      const response = await adminApi.delete(
        `/api/trusty/deletestudent/${studentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  },

  // Delete HOD
  deleteHod: async (hodId) => {
    try {
      const response = await adminApi.delete(
        `/api/trusty/deletehod/${hodId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting HOD:", error);
      throw error;
    }
  },
};

// Analytics API services
export const analyticsService = {
  // Get student performance data
  getStudentPerformance: async (studentId) => {
    try {
      const response = await mainApi.get(
        `/api/analytics/student/${studentId}/performance`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching student performance:", error);
      throw error;
    }
  },

  // Get student attendance data
  getStudentAttendance: async (studentId) => {
    try {
      const response = await mainApi.get(
        `/api/analytics/student/${studentId}/attendance`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      throw error;
    }
  },

  // Get student engagement data
  getStudentEngagement: async (studentId) => {
    try {
      const response = await mainApi.get(
        `/api/analytics/student/${studentId}/engagement`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching student engagement:", error);
      throw error;
    }
  },
};

// Medical API services
export const medicalService = {
  // Analyze X-ray image
  analyzeXray: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await mainApi.post(
        "/api/medical/analyze-xray",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error analyzing X-ray:", error);
      throw error;
    }
  },

  // Medical chat
  medicalChat: async (message) => {
    try {
      const response = await mainApi.post("/api/medical/chat", { message });
      return response.data;
    } catch (error) {
      console.error("Error with medical chat:", error);
      throw error;
    }
  },

  // Read and analyze general medical image
  readImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await mainApi.post("/api/medical/read-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error reading image:", error);
      throw error;
    }
  },
};

// Authentication service
export const authService = {
  login: async (credentials) => {
    try {
      const response = await mainApi.post("/api/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userRole", response.data.user.role);
        localStorage.setItem("userId", response.data.user.id);
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName") || "उपयोगकर्ता";
    const email = localStorage.getItem("userEmail") || "user@example.com";

    if (token && role && id) {
      return { token, role, id, name, email };
    }
    return null;
  },
};

export default {
  chatService,
  lessonPlanningService,
  userService,
  analyticsService,
  authService,
  medicalService,
};
