
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { authApi } from './services/api';
import { Toast } from './components/Toast';
import { AuthShell } from './components/AuthShell';
import { AppShell } from './components/AppShell';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminShell } from './components/AdminShell';
import type { NavPanel } from './types';

/** Main app shell (handles Customer and Merchant portals) */
function MainApp({ defaultPanel }: { defaultPanel?: NavPanel }) {
  const { user, isInitializing, setActivePanel } = useAuthStore();

  useEffect(() => {
    if (defaultPanel) {
      setActivePanel(defaultPanel);
    }
  }, [defaultPanel, setActivePanel]);

  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <span style={{ color: 'var(--text-muted, #aaa)', fontSize: '14px' }}>
          Loading…
        </span>
      </div>
    );
  }

  return !user ? <AuthShell /> : <AppShell />;
}

export function App() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    let cancelled = false;

    const handleUnauthorized = () => {
      if (!cancelled) {
        logout();
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const verifySession = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const user = await authApi.me();

        if (cancelled) return;

        if (user) {
          setAuth(user, token);
        } else {
          // The server rejected the stored access token.
          logout();
        }
      } catch (error) {
        if (cancelled) return;

        // A network/server failure is not proof that the session is invalid.
        // Keep the stored token so the user can retry after the backend returns.
        console.error('Session verification failed:', error);
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    void verifySession();

    return () => {
      cancelled = true;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [token, setAuth, logout, setInitializing]);

  return (
    <BrowserRouter>
      <div id="app">
        <Toast />

        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminShell />} />

          <Route
            path="/merchant"
            element={<MainApp defaultPanel="merchant" />}
          />

          <Route path="/*" element={<MainApp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
