import { create } from 'zustand';
import type { AuthScreen, CreditCardApplication, NavPanel, NotificationItem, User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;

  authScreen: AuthScreen;
  activePanel: NavPanel;
  application: CreditCardApplication | null;
  applicationDraft: Partial<CreditCardApplication>;
  notifications: NotificationItem[];
  hasUnreadNotifs: boolean;
  toastMessage: string | null;
  
  // Actions

  setAuthScreen: (screen: AuthScreen) => void;
  setActivePanel: (panel: NavPanel) => void;
  setAuth: (user: User, token: string) => void;
  updateUserProfile: (user: Partial<User>) => void;
  logout: () => void;
  setApplication: (app: CreditCardApplication | null) => void;
  updateApplicationDraft: (draft: Partial<CreditCardApplication>) => void;
  setNotifications: (notifs: NotificationItem[]) => void;
  addNotification: (title: string, body: string) => void;
  clearUnreadNotifs: () => void;
  showToast: (msg: string) => void;
}

const savedToken = localStorage.getItem('token');
const savedUserStr = localStorage.getItem('user');
const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
const savedAppStr = localStorage.getItem('mc_app');
const savedApp = savedAppStr ? JSON.parse(savedAppStr) : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: savedUser,
  token: savedToken,

  authScreen: 'login',
  activePanel: 'dashboard',
  application: savedApp,
  applicationDraft: {},
  notifications: [
    {
      id: 1,
      title: 'Welcome to Meridian Credit',
      body: 'Your account is ready. Start your credit card application anytime.',
      time: 'Just now',
      isRead: false,
    },
  ],
  hasUnreadNotifs: false,
  toastMessage: null,


  setAuthScreen: (screen) => set({ authScreen: screen }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    const defaultPanel: NavPanel = user.role === 'Merchant' ? 'merchant' : 'dashboard';
    set({ user, token, activePanel: defaultPanel });
  },

  updateUserProfile: (updatedFields) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updatedFields };
    localStorage.setItem('user', JSON.stringify(updated));
    set({ user: updated });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mc_app');
    set({
      user: null,
      token: null,
      application: null,
      applicationDraft: {},
      authScreen: 'login',
      activePanel: 'dashboard',
    });
  },

  setApplication: (app) => {
    if (app) {
      localStorage.setItem('mc_app', JSON.stringify(app));
    } else {
      localStorage.removeItem('mc_app');
    }
    set({ application: app });
  },

  updateApplicationDraft: (draft) => {
    set((state) => ({
      applicationDraft: { ...state.applicationDraft, ...draft },
    }));
  },

  setNotifications: (notifs) => set({ notifications: notifs }),

  addNotification: (title, body) => {
    const newNotif: NotificationItem = {
      id: Date.now(),
      title,
      body,
      time: 'Just now',
      isRead: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      hasUnreadNotifs: true,
    }));
  },

  clearUnreadNotifs: () => set({ hasUnreadNotifs: false }),

  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      if (get().toastMessage === msg) {
        set({ toastMessage: null });
      }
    }, 2600);
  },
}));
