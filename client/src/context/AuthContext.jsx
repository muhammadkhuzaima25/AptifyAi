import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('aptifyai_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
        localStorage.setItem('aptifyai_user', JSON.stringify(data));
      } catch (err) {
        localStorage.removeItem('aptifyai_token');
        localStorage.removeItem('aptifyai_user');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = (data) => {
    if (!data || !data.token) return;
    localStorage.setItem('aptifyai_token', data.token);
    const u = {
      _id: data._id,
      name: data.name || '',
      email: data.email || '',
      targetExam: data.targetExam || '',
      streak: data.streak ?? 0,
    };
    localStorage.setItem('aptifyai_user', JSON.stringify(u));
    setUser(u);
  };

  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch };
      localStorage.setItem('aptifyai_user', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem('aptifyai_token');
    localStorage.removeItem('aptifyai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
