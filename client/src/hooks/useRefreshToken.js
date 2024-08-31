import axios from '../config/axiosConfig'
import useAuth from './useAuth'

const useRefreshToken = () => {
  const { setAuth } = useAuth()
  // send a new access token using the refresh token
  const refresh = async () => {
    const response = await axios.get('/api/refreshToken', { withCredentials: true })
    //return the previous state but overwrite the accessToken with a new one
    setAuth((prev) => {
      return { ...prev, user: response.data.user, roles: response.data.user.roles, accessToken: response.data.accessToken }
    })
    return response.data.accessToken
  }
  return refresh
}
export default useRefreshToken
