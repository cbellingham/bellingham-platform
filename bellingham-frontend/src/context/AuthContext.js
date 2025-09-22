import { createContext } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  username: null,
  expiresAt: null,
  login: () => {},
  logout: async () => {},
});

export default AuthContext;
