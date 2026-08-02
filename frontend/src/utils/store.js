import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      username: '',

      setUsername: (newUsername) =>
        set({
          username: newUsername,
        }),

      removeUsername: () =>
        set({
          username: '',
        }),
    }),
    {
      name: 'user-store',
    }
  )
);

export default useStore;