import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      const currentToken = authService.getToken();

      if (currentUser && currentToken) {
        setUser(currentUser);
        setToken(currentToken);
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      return { success: false, error: message };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar usuario';
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
