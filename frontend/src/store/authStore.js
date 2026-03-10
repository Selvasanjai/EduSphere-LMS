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
          console.log('Login request to:', `${API}/auth/login`);
          const { data } = await axios.post(`${API}/auth/login`, { email, password });
          console.log('Login response:', data);
          
          if (!data.token) {
            throw new Error('No token received from server');
          }
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          console.error('Login error details:', {
            status: err.response?.status,
            message: err.response?.data?.message,
            data: err.response?.data,
            error: err.message
          });
          const errorMsg = err.response?.data?.message || err.message || 'Login failed';
          set({ loading: false, error: errorMsg });
          throw err;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          console.log('Register request to:', `${API}/auth/register`);
          const { data } = await axios.post(`${API}/auth/register`, userData);
          console.log('Register response:', data);
          
          if (!data.token) {
            throw new Error('No token received from server');
          }
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          console.error('Register error details:', {
            status: err.response?.status,
            message: err.response?.data?.message,
            data: err.response?.data,
            error: err.message
          });
          const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
          set({ loading: false, error: errorMsg });
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
    { name: 'edusphere-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);

export default useAuthStore;
