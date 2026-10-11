import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import config from '../config';
import {
  getAuthToken,
  getStoredUser,
  storeAuthToken,
  storeUser,
  removeAuthToken,
  isAuthenticated as checkIsAuthenticated,
  decodeToken
} from '../utils/authUtils';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Synchronous initialization prevents flash-of-unauthenticated state
  const initialToken = getAuthToken();
  const initialUser = getStoredUser();
  const initialAuthed = checkIsAuthenticated();

  const [token, setToken] = useState(initialAuthed ? initialToken : null);
  const [user, setUser] = useState(initialAuthed ? initialUser : null);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthed);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const login = useCallback((newToken, newUser, remember = true) => {
    storeAuthToken(newToken, remember);
    storeUser(newUser, remember);
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    storeUser(updatedUser, true);
  }, []);

  // Verify session with backend on mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const activeToken = getAuthToken();
      if (!activeToken || !checkIsAuthenticated()) {
        if (isMounted) {
          logout();
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${config.API_BASE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.valid && data.user) {
            setUser((prev) => ({ ...prev, ...data.user }));
            storeUser(data.user, true);
            setIsAuthenticated(true);
          }
        } else if (response.status === 401) {
          // Token is rejected by backend (revoked, altered secret, deleted user)
          console.warn('[Auth] Server rejected token session.');
          if (isMounted) {
            logout();
          }
        }
      } catch (err) {
        // If backend is temporarily unreachable, rely on valid unexpired client JWT
        console.warn('[Auth] Session check offline/fallback:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    // Listen for global logout events (e.g. from 401 interceptors)
    const handleGlobalLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleGlobalLogout);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, [logout]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
