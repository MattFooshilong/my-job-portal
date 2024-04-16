import { axiosForImages } from '../config/axiosConfig'
import { useEffect } from 'react'
import useRefreshToken from './useRefreshToken'
import useAuth from './useAuth'

//for getting data eg users
const useAxiosWithInterceptors = () => {
  const { auth } = useAuth()
  const refresh = useRefreshToken()

  useEffect(() => {
    const requestInterceptor = axiosForImages.interceptors.request.use(
      (config) => {
        // if this is first attempt
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${auth?.accessToken}`
        }
        return config
      },
      (error) => {
        // Do something with request error
        return Promise.reject(error)
      }
    )

    //intercepts the response and get a new access token (while the refresh token is still valid)
    const responseInterceptor = axiosForImages.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true
          const newAccessToken = await refresh()
          prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
          return axiosForImages(prevRequest) //call the request again but this time with the new accessToken
        }
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        return Promise.reject(error)
      }
    )

    return () => {
      //clean up interceptors if not it will pile up
      axiosForImages.interceptors.request.eject(requestInterceptor)
      axiosForImages.interceptors.response.eject(responseInterceptor)
    }
  }, [auth, refresh])
  return axiosForImages
}
export default useAxiosWithInterceptors
