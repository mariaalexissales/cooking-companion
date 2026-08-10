import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import ThemeControllerProvider from './theme/ThemeController';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeControllerProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeControllerProvider>
  </StrictMode>,
);
