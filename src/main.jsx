import { LanguageProvider } from './context/LanguageContext';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'DEVTOOLS_DETECTED') {
            document.body.innerHTML = '';
            window.location.href = '/';
          }
        });
      })
      .catch((err) => console.error('[SW] Registration failed:', err));
  });
}

const detectDevTools = () => {
  const threshold = 160;
  const widthDiff = window.outerWidth - window.innerWidth > threshold;
  const heightDiff = window.outerHeight - window.innerHeight > threshold;

  if (widthDiff || heightDiff) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'DEVTOOLS_OPEN' });
    }
    document.body.innerHTML = '';
    window.location.replace('/');
  }
};

setInterval(detectDevTools, 1000);

document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

setInterval(() => {
  (new Function('debugger'))();
}, 100);

createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <ToastContainer
      position="bottom-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </LanguageProvider>
);