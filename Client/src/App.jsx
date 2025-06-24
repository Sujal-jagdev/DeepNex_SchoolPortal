import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'

// Pages
import Home from './Pages/Home.jsx'
import About from './Pages/About.jsx'
import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import NotFound from './Pages/NotFound.jsx'
import ProfileCompletion from './Pages/ProfileCompletion.jsx'
import ResetPassword from './Pages/ResetPassword.jsx'
import ForgotPassword from './Pages/ForgotPassword.jsx'

// Dashboards
import StudentDashboard from './Pages/dashboards/StudentDashboard'
import TeacherDashboard from './Pages/dashboards/TeacherDashboard'
import HODDashboard from './Pages/dashboards/HODDashboard'
import AdminDashboard from './Pages/dashboards/AdminDashboard'
import AIAssistant from './Pages/dashboards/AIAssistant'
import TeacherAssistant from './Pages/dashboards/TeacherAssistant'
import StudentAnalytics from './Pages/dashboards/StudentAnalytics'
import Messages from './Pages/dashboards/Messages'
import TeacherStudents from './Pages/dashboards/TeacherStudents'
import TeacherAnalytics from './Pages/dashboards/TeacherAnalytics'
import HODTeachers from './Pages/dashboards/HODTeachers'
import HODAnalytics from './Pages/dashboards/HODAnalytics'
import AdminUsers from './Pages/dashboards/AdminUsers'
import AdminAnalytics from './Pages/dashboards/AdminAnalytics'
import AdminSettings from './Pages/dashboards/AdminSettings'
import LessonPlanning from './Pages/dashboards/LessonPlanning'
import Profile from './Pages/dashboards/Profile'

// Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthCallback from './components/auth/AuthCallback'

function App() {
  // Use localStorage to persist authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  })
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('userRole') || null;
  })

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
    localStorage.setItem('userRole', userRole || '');
  }, [isAuthenticated, userRole]);

  // Login function
  const handleLogin = (role) => {
    setIsAuthenticated(true)
    setUserRole(role)
    toast.success(`Successfully logged in as ${role}!`)
  }

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    toast.success('Successfully logged out!')
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes with Navbar and Footer */}
        <Route path="/" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              <Home />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/about" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              <About />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/login" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              {isAuthenticated ? 
                <Navigate to={`/dashboard/${userRole}`} /> : 
                <Login onLogin={handleLogin} />
              }
            </main>
            <Footer />
          </div>
        } />
        <Route path="/signup" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              {isAuthenticated ? 
                <Navigate to={`/dashboard/${userRole}`} /> : 
                <Signup onLogin={handleLogin} />
              }
            </main>
            <Footer />
          </div>
        } />
        <Route path="/profile-completion" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              <ProfileCompletion />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/reset-password" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              <ResetPassword />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/forgot-password" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              <ForgotPassword />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/not-found" element={
          <div className="flex flex-col min-h-screen">
            <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
            <main className="flex-grow">
              <NotFound />
            </main>
            <Footer />
          </div>
        } />
        
        {/* Protected Dashboard Routes with Sidebar */}
        <Route path="/dashboard/student" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="student" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="teacher" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <TeacherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/students" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="teacher" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <TeacherStudents />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/analytics" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="teacher" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <TeacherAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/hod" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="hod" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <HODDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/hod/teachers" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="hod" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <HODTeachers />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/hod/analytics" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="hod" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <HODAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/users" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <AdminUsers />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/analytics" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <AdminAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin/settings" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="admin" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <AdminSettings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* AI Assistant Routes */}
        {/* Student AI Assistant */}
        <Route path="/dashboard/student/ai-assistant" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="student" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <AIAssistant />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Teacher AI Assistant */}
        <Route path="/dashboard/teacher/ai-assistant" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole="teacher" userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <TeacherAssistant />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* AI Assistant for other roles */}
        <Route path="/dashboard/:role/ai-assistant" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole={userRole} userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <AIAssistant />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/:role/lesson-planning" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole={userRole} userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <LessonPlanning />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/:role/student-analytics" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole={userRole} userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <StudentAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/:role/messages" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole={userRole} userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <Messages />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Profile Page Route */}
        <Route path="/dashboard/:role/profile" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} requiredRole={userRole} userRole={userRole}>
            <DashboardLayout userRole={userRole} onLogout={handleLogout}>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Auth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Router>
  )
}

export default App
