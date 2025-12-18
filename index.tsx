
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error crítico al montar TreadPro:', error);
    container.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px; color: white; text-align: center; background: #0f172a; font-family: sans-serif;">
        <h2 style="color: #ef4444;">Error de Inicio</h2>
        <p style="color: #94a3b8; margin-top: 10px;">No se pudo cargar la aplicación. Por favor, recarga la página o revisa tu conexión.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #10b981; border: none; border-radius: 8px; color: #0f172a; font-weight: bold; cursor: pointer;">REINTENTAR</button>
      </div>
    `;
  }
}
