import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useRefreshToken from '../hooks/useRefreshToken'
import useAuth from '../hooks/useAuth'
import Spinner from 'react-bootstrap/Spinner'

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true)
  const refresh = useRefreshToken()
  const { auth } = useAuth()
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        //get a new access token and set in auth state
        await refresh()
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    //when user clicks refresh or comes back from another page (eg google), auth will have no accessToken
    //if no access token, get a new one
    !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false)
  }, [])
  useEffect(() => {
    console.log(`isLoading: ${isLoading}`)
    console.log(`aT: ${JSON.stringify(auth?.accessToken)}`)
  }, [isLoading])

  //all the nested routes under PersistLogin in App.js will appear under here in Outlet
  return <>{isLoading ? <Spinner animation="border" className="mt-5" /> : <Outlet />}</>
}
export default PersistLogin
