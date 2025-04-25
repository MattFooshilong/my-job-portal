import { createContext, useState } from 'react';
import type AppProps from '../config/AppProps';

type User = {
  userId: string;
  email: string;
  roles: number[];
};

type authType = {
  user: User;
  roles: number[];
  accessToken: string;
};

interface AuthContextValue {
  auth: authType | Record<string, never>;
  setAuth: React.Dispatch<React.SetStateAction<any>>;
  persist: boolean;
  setPersist: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextValue>({
  auth: {},
  setAuth: () => {
    //do nothing
  },
  persist: false,
  setPersist: () => {
    //do nothing
  },
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

export default AuthContext;
