
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const initApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Render error:', err);
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.innerText = 'Error al renderizar la App';
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
