import useAuth from '../hooks/useAuth'
import { useLocation, Navigate, Outlet } from 'react-router-dom'

const RequireAuth = () => {
  const { auth } = useAuth()
  const location = useLocation() // <-- get current location being accessed

  return (
    //if authenticated go to protected routes, else go to login page.
    //state - assign the current location in a state to a from property so you can go back to the page after logging in.
    //replace - replaces the current entry in the history stack with the new location.
    auth?.user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
  )
}

export default RequireAuth
