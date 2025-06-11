import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Wrapper from './Components/Wrapper'
import ResetPassword from './Components/ResetPassword'
import ConfirmRegistration from './Components/ConfirmRegistration'
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

// Import route utilities
import { publicRoutes, protectedRoutes } from './helper/routeUtils'

const App = () => {
  // Component mapping for dynamic route generation
  const componentMap = {
    Home,
    Login,
    Register,
    About,
    Courses,
    ResetPassword,
    ConfirmRegistration,
    TeacherChatBot,
    ProfileCompletion,
    StudentProfile,
    StudentChat,
    TeacherProfile,
    HODProfile,
    TeacherDashboard,
    TeacherPortal,
    HODDashboard,
    TrusteeDashboard,
    Students,
    Dashboard
  }

  return (
    <BrowserRouter>
      <DarkModeProvider>
        <Navbar />
      </DarkModeProvider>
      <br /><br />
      <Routes>
        {/* Generate public routes */}
        {publicRoutes.map(route => {
          const Component = componentMap[route.component]
          return (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                route.requiresAuth ? (
                  <Wrapper>
                    <Component />
                  </Wrapper>
                ) : (
                  <Component />
                )
              } 
            />
          )
        })}

        {/* Generate protected routes */}
        {protectedRoutes.map(route => {
          const Component = componentMap[route.component]
          return (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <Wrapper requiredRole={route.allowedRoles[0]}>
                  <Component />
                </Wrapper>
              } 
            />
          )
        })}
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
