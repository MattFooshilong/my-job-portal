import { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SignUp from './pages/signup/SignUp';
import Nav from './components/navbar/navbar';
import PublicProfile from './pages/public-profile/PublicProfile';
import ProfileSettings from './pages/profile-settings/ProfileSettings';
import MyProfile from './pages/my-profile/MyProfile';
import Jobs from './pages/jobs/Jobs';
import FullPageJob from './pages/jobs/FullPageJob';
import JobApplications from './pages/job-applications/JobApplications';
import Layout from './Layout';
import Missing from './pages/missing/Missing';
import RequireAuth from './components/RequireAuth';
import Unauthorized from './pages/unauthorized/Unauthorized';
import AdminDashboard from './pages/admin-dashboard/AdminDashboard';
import PersistLogin from './components/PersistLogin';
import Login from './pages/login/Login';
import Spinner from 'react-bootstrap/Spinner';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

//lazy loaded components
const Admin = lazy(() => import('./pages/admin-dashboard/AdminDashboard'));

const App = () => {
  const ROLES = {
    Admin: 1,
    User: 2
  };
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job/:id" element={<FullPageJob />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              <Route path="/public-profile" element={<PublicProfile />} />
              <Route path="/job-applications" element={<JobApplications />} />
            </Route>
            <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
              <Route
                path="/admin-dashboard"
                element={
                  <ErrorBoundary fallback={<h2>Could not fetch. Please refresh</h2>} onReset={() => navigate('/')}>
                    <Suspense fallback={<Spinner animation="border" className="mt-5" />}>
                      <Admin />
                    </Suspense>
                  </ErrorBoundary>
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
