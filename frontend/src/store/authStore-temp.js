import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Global API Configuration
const API =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:5001/api');

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
          console.log('🔍 Login attempt:', { email, api: API });

          const response = await axios.post(
            `${API}/auth/login`,
            {
              email,
              password,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              timeout: 10000,
            }
          );

          console.log('📊 Login response:', response.status, response.data);

          if (!response.data || !response.data.success) {
            throw new Error(response.data?.message || 'Login failed');
          }

          const token = response.data.token;
          const user = response.data.user;

          if (!token || !user) {
            throw new Error('Invalid response from server');
          }

          // Set axios default header for future requests
          axios.defaults.headers.common['Authorization'] = token;
          localStorage.setItem('token', token);

          set({ user, token, loading: false });

          console.log('✅ Login successful:', {
            user: user.name,
            role: user.role,
          });
          return { success: true, user, token };
        } catch (err) {
          console.error('❌ Login error:', err);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            'Login failed. Please check your credentials.';
          set({ loading: false, error: errorMessage });
          throw err;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          console.log('🔍 Register attempt:', userData);

          const response = await axios.post(`${API}/auth/register`, userData, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 10000,
          });

          console.log('📊 Register response:', response.status, response.data);

          if (!response.data || !response.data.success) {
            throw new Error(response.data?.message || 'Registration failed');
          }

          const token = response.data.token;
          const user = response.data.user;

          if (!token || !user) {
            throw new Error('Invalid response from server');
          }

          // Set axios default header for future requests
          axios.defaults.headers.common['Authorization'] = token;
          localStorage.setItem('token', token);

          set({ user, token, loading: false });

          console.log('✅ Register successful:', {
            user: user.name,
            role: user.role,
          });
          return { success: true, user, token };
        } catch (err) {
          console.error('❌ Register error:', err);
          const errorMessage =
            err.response?.data?.message || err.message || 'Registration failed';
          set({ loading: false, error: errorMessage });
          throw err;
        }
      },

      logout: () => {
        console.log('🔍 Logging out...');
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        set({ user: null, token: null });
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
