import React from 'react';
import { createRoot } from 'react-dom/client'; // Importación correcta
import App from './App';
import './index.css'; // Asegúrate de tener estilos si los usas

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
