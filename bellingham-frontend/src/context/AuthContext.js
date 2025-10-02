import { createContext } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  username: null,
  expiresAt: null,
  token: null,
  login: () => {},
  logout: async () => {},
  profile: null,
  permissions: [],
  role: null,
  refreshProfile: async () => {},
  isProfileLoading: false,
});

export default AuthContext;
