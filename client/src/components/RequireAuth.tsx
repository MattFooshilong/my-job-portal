import useAuth from '../hooks/useAuth';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
const RequireAuth = ({ allowedRoles }: AllowedRoles) => {
  const { auth } = useAuth();
  const location = useLocation(); // <-- get current location being accessed
  return (
    //if roles are authorized, go to protected nested routes in App.js. Else go to unauth page. If not logged in, go to login page.
    //state - assign the current location in a state to a from property so you can go back (back button) to the page after logging in.
    //replace - replaces the current entry in the history stack with the new location.
    <>{auth?.roles?.find((role) => allowedRoles?.includes(role)) ? <Outlet /> : auth?.accessToken ? <Navigate to="/unauthorized" state={{ from: location }} replace /> : <Navigate to="/login" state={{ from: location }} replace />}</>
  );
};
type AllowedRoles = {
  allowedRoles: number[];
};
export default RequireAuth;
