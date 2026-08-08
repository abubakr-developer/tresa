import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { initSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('tresa_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => {
          setUser(data);
          const s = initSocket(token);
          setSocket(s);
          s.on('notification', (notif) => {
            setNotifications((prev) => [notif, ...prev]);
          });
        })
        .catch(() => localStorage.removeItem('tresa_token'))
        .finally(() => setLoading(false));

      api.get('/users/notifications').then(({ data }) => setNotifications(data)).catch(() => {});
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('tresa_token', data.token);
    setUser(data.user);
    const s = initSocket(data.token);
    setSocket(s);
    s.on('notification', (notif) => setNotifications((prev) => [notif, ...prev]));
    const notifs = await api.get('/users/notifications');
    setNotifications(notifs.data);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('tresa_token', data.token);
    setUser(data.user);
    const s = initSocket(data.token);
    setSocket(s);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('tresa_token');
    setUser(null);
    setNotifications([]);
    disconnectSocket();
    setSocket(null);
  };

  const markNotificationsRead = async () => {
    await api.put('/users/notifications/read');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, socket, login, register, logout, notifications, markNotificationsRead }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
