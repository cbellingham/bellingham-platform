import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthContext from './AuthContext';
import api, { setAuthToken } from '../utils/api';

const STORAGE_KEYS = {
  username: 'auth.username',
  expiresAt: 'auth.expiresAt',
  token: 'auth.token',
};

const getStoredItem = (key) => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const parseStoredDate = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const AuthProvider = ({ children }) => {
  const storedUsername = getStoredItem(STORAGE_KEYS.username);
  const storedExpiry = parseStoredDate(getStoredItem(STORAGE_KEYS.expiresAt));
  const storedToken = getStoredItem(STORAGE_KEYS.token);
  const hasValidStoredSession = Boolean(
    storedUsername && storedExpiry && storedExpiry.getTime() > Date.now(),
  );

  const [isAuthenticated, setIsAuthenticated] = useState(hasValidStoredSession);
  const [username, setUsername] = useState(hasValidStoredSession ? storedUsername : null);
  const [expiresAt, setExpiresAt] = useState(hasValidStoredSession ? storedExpiry : null);
  const [token, setToken] = useState(storedToken);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const logoutTimerRef = useRef();

  const persistSession = useCallback((nextUsername, expiryDate, nextToken) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (nextUsername && expiryDate) {
      window.localStorage.setItem(STORAGE_KEYS.username, nextUsername);
      window.localStorage.setItem(STORAGE_KEYS.expiresAt, expiryDate.toISOString());
      if (nextToken) {
        window.localStorage.setItem(STORAGE_KEYS.token, nextToken);
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.token);
      }
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.username);
      window.localStorage.removeItem(STORAGE_KEYS.expiresAt);
      window.localStorage.removeItem(STORAGE_KEYS.token);
    }
  }, []);

  const applySession = useCallback((nextUsername, expiryIso, persist = true, nextToken = undefined) => {
    const expiryDate = expiryIso ? parseStoredDate(expiryIso) : null;
    const tokenToUse = nextToken === undefined ? token : nextToken;
    const isValid = Boolean(
      nextUsername && expiryDate && expiryDate.getTime() > Date.now(),
    );

    if (isValid && expiryDate) {
      setIsAuthenticated(true);
      setUsername(nextUsername);
      setExpiresAt(expiryDate);
      setToken(tokenToUse ?? null);
      if (persist) {
        persistSession(nextUsername, expiryDate, tokenToUse ?? null);
      }
    } else {
      setIsAuthenticated(false);
      setUsername(null);
      setExpiresAt(null);
      setToken(null);
      setProfile(null);
      if (persist) {
        persistSession(null, null, null);
      }
    }
  }, [persistSession, token]);

  const login = useCallback(({ username: nextUsername, expiresAt: expiryIso, token: sessionToken }) => {
    applySession(nextUsername ?? null, expiryIso ?? null, true, sessionToken ?? null);
  }, [applySession]);

  const logout = useCallback(async () => {
    applySession(null, null);
    setProfile(null);
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Failed to clear session cookie', error);
    }
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
    setIsProfileLoading(true);
    try {
      const res = await api.get('/api/profile');
      setProfile(res.data ?? null);
    } catch (error) {
      if (error?.response?.status === 401) {
        applySession(null, null);
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, [applySession, isAuthenticated]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = undefined;
    }

    if (!expiresAt) {
      return undefined;
    }

    const timeout = expiresAt.getTime() - Date.now();
    if (timeout <= 0) {
      logout().catch(() => {});
      return undefined;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      logout().catch(() => {});
    }, timeout);

    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = undefined;
      }
    };
  }, [expiresAt, logout]);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const res = await api.get('/api/session');
        if (!isMounted) {
          return;
        }
        const { username: sessionUsername, expiresAt: sessionExpiry } = res.data ?? {};
        applySession(sessionUsername ?? null, sessionExpiry ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        if (error?.response?.status === 401) {
          applySession(null, null);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [applySession]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleSessionExpired = () => {
      logout().catch(() => {});
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [logout]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated, refreshProfile]);

  const value = useMemo(() => ({
    isAuthenticated,
    username,
    expiresAt,
    token,
    login,
    logout,
    profile,
    permissions: profile?.permissions ?? [],
    role: profile?.role ?? null,
    refreshProfile,
    isProfileLoading,
  }), [isAuthenticated, username, expiresAt, token, login, logout, profile, refreshProfile, isProfileLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
