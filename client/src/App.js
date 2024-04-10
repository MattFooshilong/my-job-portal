import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from './pages/login/Login'
import SignUp from './pages/signup/SignUp'
import Nav from './components/navbar/navbar'
import PublicProfile from './pages/public-profile/PublicProfile'
import ProfileSettings from './pages/profile-settings/ProfileSettings'
import MyProfile from './pages/my-profile/MyProfile'
import Jobs from './pages/jobs/Jobs'
import FullPageJob from './pages/jobs/FullPageJob'
import JobApplications from './pages/job-applications/JobApplications'
import { jwtDecode } from 'jwt-decode'
import Layout from './Layout'
import Missing from './pages/Missing'

const isTokenExpired = (token) => {
  if (!token) return true // Return true if no token provided
  const decodedToken = jwtDecode(token)
  return decodedToken.exp < Date.now() / 1000 // Compare with current time
}

const ProtectedRoutes = () => {
  const token = localStorage.getItem('token')
  return isTokenExpired(token) ? <Outlet /> : <Navigate to="/jobs" />
}

const App = () => {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job/:id" element={<FullPageJob />} />

          {/* protected routes */}
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/public-profile" element={<PublicProfile />} />
          <Route path="/job-applications" element={<JobApplications />} />

          {/* catch all */}
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
