import { createContext } from 'react';

const AuthContext = createContext({
  token: null,
  username: null,
  login: () => {},
  logout: () => {},
});

export default AuthContext;
