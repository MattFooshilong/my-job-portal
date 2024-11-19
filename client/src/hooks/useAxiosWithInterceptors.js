//from youtube comments, this only works for axios to 0.27.2.
/**
 *
 * axios >= 1.0.0 will cause your response interceptor to reject an error when retrying.
 * There are a few lines in the axios source code that, when trying to normalize values, ends up returning any unknown value via toString,
 * which ends up spitting out an entire function being toStringed as the error passed into the response interceptor.
 */

import { axiosPrivate } from '../config/axiosConfig'
import { useEffect } from 'react'
import useRefreshToken from './useRefreshToken'
import useAuth from './useAuth'

//for getting data eg users
const useAxiosWithInterceptors = () => {
  const { auth } = useAuth()
  const refresh = useRefreshToken()

  useEffect(() => {
    const requestInterceptor = axiosPrivate.interceptors.request.use(
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
    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const prevRequest = error?.config
        //if .sent does not exist/false, a flag to only call this twice max
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true
          try {
            const newAccessToken = await refresh()
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
            return axiosPrivate(prevRequest) //call the request again but this time with the new accessToken
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            return Promise.reject(refreshError) // Forward the refresh error
          }
        }
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        else {
          console.error('Unhandled error response:', error)
          return Promise.reject(error)
        }
      }
    )

    return () => {
      //clean up interceptors if not it will pile up
      axiosPrivate.interceptors.request.eject(requestInterceptor)
      axiosPrivate.interceptors.response.eject(responseInterceptor)
    }
  }, [auth, refresh])
  return axiosPrivate
}
export default useAxiosWithInterceptors
