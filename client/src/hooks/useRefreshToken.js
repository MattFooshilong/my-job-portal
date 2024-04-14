import axios from '../config/axiosConfig'
import useAuth from './useAuth'

const useRefreshToken = () => {
  const { setAuth } = useAuth()
  // send a new access token using the refresh token
  const refresh = async () => {
    const response = await axios.get('/api/refreshToken', { withCredentials: true })
    setAuth((prev) => {
      return { ...prev, accessToken: response.data.accessToken }
    })
    return response.data.accessToken
  }
  return refresh
}
export default useRefreshToken
