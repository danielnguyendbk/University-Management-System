import { createContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authService } from "../services/authService";
import type { AuthContextValue } from "../types";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(() => authService.getPersistedUser());

  const login: AuthContextValue["login"] = async (email, password) => {
    const loggedInUser = await authService.login({ email, password });
    setUser(loggedInUser);
    authService.persistUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
    authService.persistUser(null);
  };

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
