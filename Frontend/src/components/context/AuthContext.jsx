import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a custom axios instance that always attaches the token
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskmanager_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to normalize _id to id
  const normalizeUser = (user) => user ? { ...user, id: user._id } : null;

  useEffect(() => {
    // Check for stored user data on app load
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('taskmanager_token');
        if (token) {
          // api instance will set the header
          const response = await api.get('/auth/me');
          setUser(normalizeUser(response.data.data.user));
        }
      } catch (err) {
        console.error(err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      localStorage.setItem('taskmanager_token', response.data.token);
      setUser(normalizeUser(response.data.data.user));
      toast.success('Login successful!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        passwordConfirm: confirmPassword,
      });
      localStorage.setItem('taskmanager_token', response.data.token);
      setUser(normalizeUser(response.data.data.user));
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('taskmanager_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};