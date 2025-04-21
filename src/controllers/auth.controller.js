//auth.controllers.js
import { createContext, useState, useContext, useEffect } from "react";
import {
  registerRequest,
  loginRequest,
  verifyTokenRequest,
  logoutRequest,
} from "../api/auth";

export const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setError] = useState([]);
  const [loading, setLoading] = useState(true);

  const signup = async (userData) => {
    try {
      const res = await registerRequest(userData);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      setError(error.response?.data || ["Registration failed"]);
    }
  };

  const signin = async (credentials) => {
    try {
      const res = await loginRequest(credentials);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      const msg = error.response?.data;
      setError(Array.isArray(msg) ? msg : [msg.message || "Login failed"]);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // ignore errors
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setError([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    (async () => {
      try {
        const res = await verifyTokenRequest();
        if (res.data) {
          setUser(res.data);
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{ signup, signin, logout, loading, user, isAuthenticated, errors }}
    >
      {children}
    </AuthContext.Provider>
  );
};
