import { create } from 'zustand';

const useUiStore = create((set) => ({
  notifications: [],

  addNotification: (message, type = 'info') => {
    if (!message) return;
    const id = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 3000);
  },

  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),

}));

export default useUiStore;
