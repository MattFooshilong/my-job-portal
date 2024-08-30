import AuthContext from '../context/AuthProvider'
import { useContext } from 'react'
//shortcut to just import one hook instead of those 2 above imports in pages
const useAuth = () => {
  return useContext(AuthContext)
}

export default useAuth
