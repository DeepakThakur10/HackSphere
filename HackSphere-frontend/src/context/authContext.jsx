import { createContext, useContext, useMemo, useState } from 'react';
import { loginRequest, signupRequest } from '../services/api';

const AuthContext = createContext(null);

const tokenKey = 'hacksphere_token';
const userKey = 'hacksphere_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(userKey);

    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(tokenKey, nextToken);
    localStorage.setItem(userKey, JSON.stringify(nextUser));
  };

  const login = async (payload) => {
    const response = await loginRequest(payload);
    const { token: nextToken, user: nextUser } = response.data;

    persistSession(nextToken, nextUser);

    return response.data;
  };

  const signup = async (payload) => {
    const response = await signupRequest(payload);
    const { token: nextToken, data: nextUser, user: altUser } = response.data;
    const finalUser = nextUser || altUser;

    if (nextToken && finalUser) {
      persistSession(nextToken, finalUser);
    }

    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
