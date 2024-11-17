import axios from '../config/axiosConfig'
import useAuth from './useAuth'

const useRefreshToken = () => {
  const { setAuth } = useAuth()
  // send a new access token using the refresh token
  // refresh code will only be called if the refreshtoken is not expired
  const refresh = async () => {
    try {
      const response = await axios.get('/api/refreshToken', { withCredentials: true })
      //return the previous state but overwrite the accessToken with a new one
      setAuth((prev) => {
        //console.log(JSON.stringify(prev))
        //console.log(response.data.accessToken)
        return { ...prev, user: response.data.user, roles: response.data.user.roles, accessToken: response.data.accessToken }
      })
      return response.data.accessToken
    } catch (error) {
      console.error('useRefreshToken error:', error)
      //return Promise.reject(error)
    }
  }
  return refresh
}
export default useRefreshToken
