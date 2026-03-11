import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import API_BASE_URL from '../api';

const API = API_BASE_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API}/auth/login`, {
            email,
            password,
          });

          const token = data.token;

          if (!token) {
            throw new Error('Login failed');
          }

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('token', token);
          set({ user: data.user, token: token, loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: 'Login failed' });
          throw err;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API}/auth/register`, userData);

          const token = data.token;

          if (!token) {
            throw new Error('Registration failed');
          }

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('token', token);
          set({ user: data.user, token: token, loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: 'Registration failed' });
          throw err;
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'edusphere-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
