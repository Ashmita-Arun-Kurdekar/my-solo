import { createContext, useContext, useMemo, useState } from "react";

import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("employee") || sessionStorage.getItem("employee");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || sessionStorage.getItem("token"));

  const login = async (credentials, options = { remember: true }) => {
    const response = await API.post("/auth/login", credentials);
    const loggedInUser = response.data.employee;
    const accessToken = response.data.token;

    // Persist token according to "remember" flag
    if (options.remember) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("employee", JSON.stringify(loggedInUser));
    } else {
      sessionStorage.setItem("token", accessToken);
      sessionStorage.setItem("employee", JSON.stringify(loggedInUser));
    }

    setToken(accessToken);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employee");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("employee");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
