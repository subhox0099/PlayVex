import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isTokenExpired } from "../utils/helpers";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount and validate token expiration
  useEffect(() => {
    try {
      const storedToken =
        sessionStorage.getItem("pv_token") || localStorage.getItem("pv_token");
      const storedUser =
        sessionStorage.getItem("pv_user") || localStorage.getItem("pv_user");

      if (storedToken && storedUser) {
        if (isTokenExpired(storedToken)) {
          // Stored token has expired (>1 hr) - clear it so user isn't stuck with 403s
          sessionStorage.removeItem("pv_token");
          sessionStorage.removeItem("pv_user");
          localStorage.removeItem("pv_token");
          localStorage.removeItem("pv_user");
          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      }
    } catch {
      sessionStorage.removeItem("pv_token");
      sessionStorage.removeItem("pv_user");
      localStorage.removeItem("pv_token");
      localStorage.removeItem("pv_user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData, jwtToken) => {
    const userObj = {
      id: userData.userid,
      username: userData.username,
      email: userData.email,
    };
    sessionStorage.setItem("pv_token", jwtToken);
    sessionStorage.setItem("pv_user", JSON.stringify(userObj));
    localStorage.setItem("pv_token", jwtToken);
    localStorage.setItem("pv_user", JSON.stringify(userObj));
    setToken(jwtToken);
    setUser(userObj);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("pv_token");
    sessionStorage.removeItem("pv_user");
    localStorage.removeItem("pv_token");
    localStorage.removeItem("pv_user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      sessionStorage.setItem("pv_user", JSON.stringify(updated));
      localStorage.setItem("pv_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
