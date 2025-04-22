import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import type AppProps from '../config/AppProps';

interface AuthContextValue {
  auth: any;
  setAuth: React.Dispatch<React.SetStateAction<any>>;
  persist: boolean;
  setPersist: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextValue>({
  auth: {},
  setAuth: () => {},
  persist: false,
  setPersist: () => {},
});

export const AuthProvider = ({ children }: AppProps) => {
  // example: setAuth({ user: data, accessToken })
  const [auth, setAuth] = useState({});
  // for trust this device
  const persistFromLocalStorage = localStorage.getItem('persist');
  const persistTemp = persistFromLocalStorage ? JSON.parse(persistFromLocalStorage) : false;
  const [persist, setPersist] = useState<boolean>(persistTemp);

  return <AuthContext.Provider value={{ auth, setAuth, persist, setPersist }}>{children}</AuthContext.Provider>;
};
AuthProvider.propTypes = {
  children: PropTypes.any,
};
export default AuthContext;
