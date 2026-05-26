import { createContext, useEffect, useMemo, useState } from "react";
import { changePassword as changePasswordRequest, getCurrentUser, login as loginRequest, logout as logoutRequest } from "../services/authService";
import { getStoredToken } from "../services/app";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const token = getStoredToken();
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (mounted) setUser(currentUser);
      } catch {
        logoutRequest();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(credentials) {
    const loggedInUser = await loginRequest(credentials);
    setUser(loggedInUser ? { ...loggedInUser } : null);
    return loggedInUser;
  }

  async function changePassword(body) {
    const updatedUser = await changePasswordRequest(body);
    setUser(updatedUser ? { ...updatedUser } : null);
    return updatedUser;
  }

  function logout() {
    logoutRequest();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, changePassword, setUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}