import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Navbar from './Components/Navbar'
import Wrapper from './Components/Wrapper'
import ResetPassword from './Components/ResetPassword'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Register from './Pages/Register'
import Footer from './Pages/Footer'
import Home from './Pages/Home'
import ProfileCompletion from './Pages/ProfileCompletion'
import About from './Pages/About'
import TrusteeDashboard from './Pages/TrusteeDashboard'
import Students from './Components/Student'
import Courses from './Pages/Courses'
import StudentChat from './Pages/StudentChat'
import { DarkModeProvider } from './Context/ThemeContext'
import StudentProfile from './Pages/StudentProfile'
import TeacherPortal from './Pages/TeacherPortal'
import TeacherProfile from './Pages/TeacherProfile'
import TeacherDashboard from './Pages/TeacherDashboard'
import HODDashboard from './Pages/HODDashboard'
import HODProfile from './Pages/HODProfile'
import TeacherChatBot from './Pages/TeacherChatBot'

const App = () => {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <Navbar />
      </DarkModeProvider>
      <br /><br />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Register />} />
        <Route path='/about' element={<About />} />
        <Route path='/courses' element={<Courses />} />
        <Route path='/update-password' element={<ResetPassword />} />
        <Route path='/teacherchat' element={<TeacherChatBot />} />
        <Route path='/profile-completion' element={<ProfileCompletion />} />

        {/* Student Routes */}
        <Route path='/student-profile' element={
          <Wrapper requiredRole="student">
            <StudentProfile />
          </Wrapper>
        } />
        <Route path='/studentchat' element={
          <Wrapper requiredRole="student">
            <StudentChat />
          </Wrapper>
        } />

        {/* Teacher Routes */}
        <Route path='/teacher-profile' element={
          <Wrapper requiredRole="teacher">
            <TeacherProfile />
          </Wrapper>
        } />
        <Route path='/hod-profile' element={
          <Wrapper requiredRole="hod">
            <HODProfile />
          </Wrapper>
        } />
        <Route path='/teacher-dashboard' element={
          <Wrapper requiredRole="teacher">
            <TeacherDashboard />
          </Wrapper>
        } />
        <Route path='/teacherportal' element={
          <Wrapper requiredRole="teacher">
            <TeacherPortal />
          </Wrapper>
        } />

        {/* HOD Routes */}
        <Route path='/dashboard' element={
          <Wrapper requiredRole="hod">
            <HODDashboard />
          </Wrapper>
        } />

        {/* Admin/Trustee Routes */}
        <Route path='/trustee-dashboard' element={
          <Wrapper requiredRole="admin">
            <TrusteeDashboard />
          </Wrapper>
        } />
        <Route path='/doctors' element={
          <Wrapper requiredRole="admin">
            <Students />
          </Wrapper>
        } />

        <Route path='/dashboard' element={
          <Wrapper>
            <Dashboard />
          </Wrapper>
        } />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
