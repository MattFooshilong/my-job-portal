import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
//import Home from './pages/dashboard/Dashboard'
import Login from './pages/login/Login'
import Nav from './components/navbar/navbar'
import PublicProfile from './pages/public-profile/PublicProfile'
import ProfileSettings from './pages/profile-settings/ProfileSettings'
import MyProfile from './pages/my-profile/MyProfile'

const ProtectedRoutes = () => {
    const isLoggedIn = localStorage.getItem('token')
    return isLoggedIn ? <Outlet /> : <Navigate to='/' />
}

const Router = () => {
    return (
        <>
            <Nav />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<ProtectedRoutes />}>
                    <Route path="/my-profile" element={<MyProfile />} />
                    <Route path="/profile-settings" element={<ProfileSettings />} />
                    <Route path="/public-profile" element={<PublicProfile />} />

                </Route>
            </Routes>
        </>

    )
}

export default Router