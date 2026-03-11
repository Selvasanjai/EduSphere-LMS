import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import API from '../api';

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

          if (!data.token) {
            throw new Error('Login failed');
          }

          axios.defaults.headers.common['Authorization'] =
            `Bearer ${data.token}`;
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, loading: false });
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

          if (!data.token) {
            throw new Error('Registration failed');
          }

          axios.defaults.headers.common['Authorization'] =
            `Bearer ${data.token}`;
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          set({ loading: false, error: 'Registration failed' });
          throw err;
        }
      },

      logout: () => {
        console.log('🔍 Logging out...');
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      setAuth: (user, token) => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('token', token);
        }
        set({ user, token });
      },

      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'edusphere-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
