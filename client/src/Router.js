import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from './pages/login/Login'
import Nav from './components/navbar/navbar'
import PublicProfile from './pages/public-profile/PublicProfile'
import ProfileSettings from './pages/profile-settings/ProfileSettings'
import MyProfile from './pages/my-profile/MyProfile'
import Jobs from './pages/jobs/Jobs'
import FullPageJob from './pages/jobs/FullPageJob'
import JobApplications from './pages/job-applications/JobApplications'

const ProtectedRoutes = () => {
    const isLoggedIn = localStorage.getItem('token')
    return isLoggedIn ? <Outlet /> : <Navigate to='/jobs' />
}

const Router = () => {
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Jobs />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/job/:id" element={<FullPageJob />} />
                <Route element={<ProtectedRoutes />}>
                    <Route path="/my-profile" element={<MyProfile />} />
                    <Route path="/profile-settings" element={<ProfileSettings />} />
                    <Route path="/public-profile" element={<PublicProfile />} />
                    <Route path="/job-applications" element={<JobApplications />} />

                </Route>
            </Routes>
        </>

    )
}

export default Router