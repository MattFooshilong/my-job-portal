import useAuth from '../hooks/useAuth'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'
const RequireAuth = ({ allowedRoles }) => {
  const { auth } = useAuth()
  const location = useLocation() // <-- get current location being accessed

  return (
    //if authenticated go to protected routes, else go to login page.
    //state - assign the current location in a state to a from property so you can go back (back button) to the page after logging in.
    //replace - replaces the current entry in the history stack with the new location.
    auth?.user?.roles?.find((role) => allowedRoles?.includes(role)) ? <Outlet /> : auth?.user ? <Navigate to="/unauthorized" state={{ from: location }} replace /> : <Navigate to="/login" state={{ from: location }} replace />
  )
}
RequireAuth.propTypes = {
  allowedRoles: PropTypes.array,
}
export default RequireAuth