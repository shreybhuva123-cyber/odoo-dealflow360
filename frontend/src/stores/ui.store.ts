import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  searchPaletteOpen: boolean;
  notificationPanelOpen: boolean;
  roleSwitcherOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSearchPaletteOpen: (open: boolean) => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setRoleSwitcherOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  searchPaletteOpen: false,
  notificationPanelOpen: false,
  roleSwitcherOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setTheme: (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  setSearchPaletteOpen: (open) => set({ searchPaletteOpen: open }),
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  setRoleSwitcherOpen: (open) => set({ roleSwitcherOpen: open }),
}));
