import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 'checking' while we confirm a saved token on first load
  const [status, setStatus] = useState(tokenStore.get() ? 'checking' : 'ready');

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setStatus('ready'));
  }, []);

  const finish = ({ user, token }) => {
    tokenStore.set(token);
    setUser(user);
    return user;
  };

  const value = useMemo(
    () => ({
      user,
      status,
      login: async (input) => finish(await api.login(input)),
      register: async (input) => finish(await api.register(input)),
      logout,
    }),
    [user, status, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
