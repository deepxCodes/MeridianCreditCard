import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
//removed per UI update
import { Toast } from './components/Toast';
// import { LoFiOverlay } from './components/LoFiOverlay';
import { AuthShell } from './components/AuthShell';
import { AppShell } from './components/AppShell';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminShell } from './components/AdminShell';
import type { NavPanel } from './types';

/** Main app shell (handles Customer and Merchant portals) */
function MainApp({ defaultPanel }: { defaultPanel?: NavPanel }) {
  const { user, setActivePanel } = useAuthStore();

  useEffect(() => {
    if (defaultPanel) {
      setActivePanel(defaultPanel);
    }
  }, [defaultPanel, setActivePanel]);

  return (
    <>
      { !user ? <AuthShell /> : <AppShell /> }
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div id="app">
        <Toast />
        <Routes>
          {/* Admin routes — completely separate from customer */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminShell />} />

          {/* Merchant direct route */}
          <Route path="/merchant" element={<MainApp defaultPanel="merchant" />} />

          {/* Customer / Default routes */}
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
