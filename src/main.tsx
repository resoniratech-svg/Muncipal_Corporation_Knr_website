import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AppProvider } from './context/AppContext';
import { PrefsProvider } from './i18n';
import { ToastProvider } from './ui/Toast';
import { TourProvider } from './ui/Tour';
import { QuickDemoProvider } from './ui/QuickDemo';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <PrefsProvider>
        <ToastProvider>
          <AuthProvider>
            <AppProvider>
              <TourProvider>
                <QuickDemoProvider>
                  <App />
                </QuickDemoProvider>
              </TourProvider>
            </AppProvider>
          </AuthProvider>
        </ToastProvider>
      </PrefsProvider>
    </HashRouter>
  </React.StrictMode>,
);
