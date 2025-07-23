import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { ConcertProvider } from './contexts/ConcertContext';
import { ToastProvider } from './contexts/ToastContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {console.log('App wrapped with AuthProvider')}
      <ToastProvider>
        <AuthProvider>
          <ConcertProvider>
            <App />
          </ConcertProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
