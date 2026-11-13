
import { create } from 'zustand';
import type { AuthScreen, CreditCardApplication, NavPanel, NotificationItem, User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  /** True while the app is calling /auth/me on startup. Prevents protected routes from rendering too early. */
  isInitializing: boolean;

  authScreen: AuthScreen;
  activePanel: NavPanel;
  application: CreditCardApplication | null;
  applicationDraft: Partial<CreditCardApplication>;
  notifications: NotificationItem[];
  hasUnreadNotifs: boolean;
  toastMessage: string | null;

  // Actions
  setInitializing: (value: boolean) => void;
  setAuthScreen: (screen: AuthScreen) => void;
  setActivePanel: (panel: NavPanel) => void;
  /**
   * Called after successful login or /auth/me response.
   * A refresh token is optional so existing /auth/me calls remain compatible.
   */
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUserProfile: (user: Partial<User>) => void;
  logout: () => void;
  setApplication: (app: CreditCardApplication | null) => void;
  updateApplicationDraft: (draft: Partial<CreditCardApplication>) => void;
  setNotifications: (notifs: NotificationItem[]) => void;
  addNotification: (title: string, body: string) => void;
  clearUnreadNotifs: () => void;
  showToast: (msg: string) => void;
}

// Persist authentication tokens, but never persist the user profile.
// The server remains the authoritative source for user information.
const savedToken = localStorage.getItem('token');
const savedRefreshToken = localStorage.getItem('refreshToken');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: savedToken,
  refreshToken: savedRefreshToken,

  isInitializing: true,

  authScreen: 'login',
  activePanel: 'dashboard',
  application: null,
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

  setInitializing: (value) => set({ isInitializing: value }),
  setAuthScreen: (screen) => set({ authScreen: screen }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('token', token);

    // Update the refresh token only when a new one is supplied.
    // This preserves it when setAuth is called after /auth/me.
    const currentRefreshToken = refreshToken ?? get().refreshToken;

    if (currentRefreshToken) {
      localStorage.setItem('refreshToken', currentRefreshToken);
    }

    const defaultPanel: NavPanel =
      user.role === 'Admin' ? 'admin' :
      user.role === 'Merchant' ? 'merchant' : 'dashboard';

    set({
      user,
      token,
      refreshToken: currentRefreshToken,
      activePanel: defaultPanel,
    });
  },

  updateUserProfile: (updatedFields) => {
    const current = get().user;
    if (!current) return;

    const updated = { ...current, ...updatedFields };
    set({ user: updated });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // Clean up legacy keys that previous versions may have written.
    localStorage.removeItem('user');
    localStorage.removeItem('mc_app');

    set({
      user: null,
      token: null,
      refreshToken: null,
      application: null,
      applicationDraft: {},
      authScreen: 'login',
      activePanel: 'dashboard',
      isInitializing: false,
    });
  },

  setApplication: (app) => {
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
