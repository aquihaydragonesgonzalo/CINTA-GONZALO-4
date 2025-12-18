
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const mount = () => {
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
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
      errorDisplay.style.display = 'block';
      errorDisplay.innerText = 'Error de montaje: ' + (err instanceof Error ? err.message : String(err));
    }
  }
};

// En módulos ESM, el script se ejecuta de forma diferida automáticamente.
// Intentamos montar directamente o esperamos a que el DOM esté listo si es necesario.
if (document.readyState === 'complete') {
  mount();
} else {
  window.addEventListener('load', mount);
}
