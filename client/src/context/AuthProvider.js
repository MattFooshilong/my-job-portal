import { createContext, useState } from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  // example: setAuth({ user: data, accessToken })
  const [auth, setAuth] = useState({})
  // for trust this device
  const [persist, setPersist] = useState(JSON.parse(localStorage.getItem('persist')) || false)

  return <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>{children}</AuthContext.Provider>
}
AuthProvider.propTypes = {
  children: PropTypes.any,
}
export default AuthContext
