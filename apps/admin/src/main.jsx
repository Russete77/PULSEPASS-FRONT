import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';

import '@pulsepass/shared/tokens.css';
import '@pulsepass/shared/components.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

// Service worker só no build de produção: em dev ele brigaria com o HMR do Vite
// e serviria código velho. Em produção é o que faz o cockpit ABRIR sem rede —
// sem isso, fechar o navegador na porta deixava o porteiro sem ferramenta.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* sem SW o app segue funcionando online — não vale quebrar o boot por isso */
    });
  });
}
