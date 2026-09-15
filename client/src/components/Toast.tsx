import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const Toast: React.FC = () => {
  const { toastMessage } = useAuthStore();

  return (
    <div
      id="toast"
      className={`toast ${toastMessage ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {toastMessage}
    </div>
  );
};
