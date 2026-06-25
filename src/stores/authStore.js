import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  roles: JSON.parse(localStorage.getItem('roles') || '[]'),
  activeRole: localStorage.getItem('activeRole') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (data) => {
    const { user, token, roles } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('roles', JSON.stringify(roles));
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, roles, isAuthenticated: true });
  },

  setActiveRole: (role) => {
    localStorage.setItem('activeRole', role);
    set({ activeRole: role });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('activeRole');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      roles: [],
      activeRole: null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
