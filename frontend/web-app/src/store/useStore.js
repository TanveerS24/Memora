import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  token: null,
  partner: null,
  couple: null,
  isPaired: false,
  
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setPartner: (partner) => set({ partner }),
  setCouple: (couple) => set({ couple }),
  setPaired: (isPaired) => set({ isPaired }),
  
  logout: () => set({
    user: null,
    token: null,
    partner: null,
    couple: null,
    isPaired: false,
  }),
  
  getTheme: () => {
    const { user, isPaired } = useStore.getState();
    if (isPaired) return 'shared';
    if (user?.gender === 'male') return 'male';
    if (user?.gender === 'female') return 'female';
    return 'shared';
  },
}));
