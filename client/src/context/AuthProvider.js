import { createContext, useState } from 'react'
import PropTypes from 'prop-types'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  // example: setAuth({ user: data, accessToken })
  const [auth, setAuth] = useState({})

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}
AuthProvider.propTypes = {
  children: PropTypes.any,
}
export default AuthContext
