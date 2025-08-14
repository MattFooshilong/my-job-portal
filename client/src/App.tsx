import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/signup/SignUp";
import Nav from "./components/navbar/navbar";
import Jobs from "./pages/jobs/Jobs";
import FullPageJob from "./pages/jobs/FullPageJob";
import Layout from "./Layout";
import Missing from "./pages/missing/Missing";
import RequireAuth from "./components/RequireAuth";
import Unauthorized from "./pages/unauthorized/Unauthorized";
import PersistLogin from "./components/PersistLogin";
import Login from "./pages/login/Login";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LazyLoad from "./components/LazyLoad";

const queryClient = new QueryClient();

//lazy loaded components
const Admin = lazy(() => import("./pages/admin-dashboard/AdminDashboard"));
const ProfileSettings = lazy(() => import("./pages/profile-settings/ProfileSettings"));
const MyProfile = lazy(() => import("./pages/my-profile/MyProfile"));
const PublicProfile = lazy(() => import("./pages/public-profile/PublicProfile"));
const JobApplications = lazy(() => import("./pages/job-applications/JobApplications"));

const App = () => {
  const ROLES = {
    Admin: 1,
    User: 2
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="/login/:userType?" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job/:id" element={<FullPageJob />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
              <Route
                path="/my-profile"
                element={
                  <LazyLoad>
                    <MyProfile />
                  </LazyLoad>
                }
              />
              <Route
                path="/profile-settings"
                element={
                  <LazyLoad>
                    <ProfileSettings />
                  </LazyLoad>
                }
              />
              <Route
                path="/public-profile"
                element={
                  <LazyLoad>
                    <PublicProfile />
                  </LazyLoad>
                }
              />
              <Route
                path="/job-applications"
                element={
                  <LazyLoad>
                    <JobApplications />
                  </LazyLoad>
                }
              />
            </Route>
            <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
              <Route
                path="/admin-dashboard"
                element={
                  <LazyLoad>
                    <Admin />
                  </LazyLoad>
                }
              />
            </Route>
          </Route>

          {/* catch all */}
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
};

export default App;
