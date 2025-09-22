import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthContext from './AuthContext';
import api from '../utils/api';

const STORAGE_KEYS = {
  username: 'auth.username',
  expiresAt: 'auth.expiresAt',
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
  const hasValidStoredSession = Boolean(
    storedUsername && storedExpiry && storedExpiry.getTime() > Date.now(),
  );

  const [isAuthenticated, setIsAuthenticated] = useState(hasValidStoredSession);
  const [username, setUsername] = useState(hasValidStoredSession ? storedUsername : null);
  const [expiresAt, setExpiresAt] = useState(hasValidStoredSession ? storedExpiry : null);
  const logoutTimerRef = useRef();

  const persistSession = useCallback((nextUsername, expiryDate) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (nextUsername && expiryDate) {
      window.localStorage.setItem(STORAGE_KEYS.username, nextUsername);
      window.localStorage.setItem(STORAGE_KEYS.expiresAt, expiryDate.toISOString());
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.username);
      window.localStorage.removeItem(STORAGE_KEYS.expiresAt);
    }
  }, []);

  const applySession = useCallback((nextUsername, expiryIso, persist = true) => {
    const expiryDate = expiryIso ? parseStoredDate(expiryIso) : null;
    const isValid = Boolean(
      nextUsername && expiryDate && expiryDate.getTime() > Date.now(),
    );

    if (isValid && expiryDate) {
      setIsAuthenticated(true);
      setUsername(nextUsername);
      setExpiresAt(expiryDate);
      if (persist) {
        persistSession(nextUsername, expiryDate);
      }
    } else {
      setIsAuthenticated(false);
      setUsername(null);
      setExpiresAt(null);
      if (persist) {
        persistSession(null, null);
      }
    }
  }, [persistSession]);

  const login = useCallback(({ username: nextUsername, expiresAt: expiryIso }) => {
    applySession(nextUsername ?? null, expiryIso ?? null);
  }, [applySession]);

  const logout = useCallback(async () => {
    applySession(null, null);
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Failed to clear session cookie', error);
    }
  }, [applySession]);

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

  const value = useMemo(() => ({
    isAuthenticated,
    username,
    expiresAt,
    login,
    logout,
  }), [isAuthenticated, username, expiresAt, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
