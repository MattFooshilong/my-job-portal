import axios from '../config/axiosConfig'
import useAuth from './useAuth'
import { useNavigate, useLocation } from 'react-router-dom'

const useLogout = () => {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const logout = async () => {
    try {
      await axios('/api/logout', { withCredentials: true })
      //if refresh token is expired, send them back to login screen. After logging in, send them back to where they were
      setAuth({})
      navigate('/login', { state: { from: location }, replace: true })
    } catch (err) {
      console.error(err)
      throw err
    }
  }
  return logout
}
export default useLogout
