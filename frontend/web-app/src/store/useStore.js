import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  partner: null,
  couple: null,
  isPaired: false,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  setPartner: (partner) => set({ partner }),
  setCouple: (couple) => set({ couple }),
  setPaired: (isPaired) => set({ isPaired }),
  
  logout: () => set({
    user: null,
    partner: null,
    couple: null,
    isPaired: false,
    isAuthenticated: false,
  }),
  
  getTheme: () => {
    const { user, isPaired } = useStore.getState();
    if (isPaired) return 'shared';
    if (user?.gender === 'male') return 'male';
    if (user?.gender === 'female') return 'female';
    return 'shared';
  },
}));
