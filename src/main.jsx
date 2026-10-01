import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { ContentProvider } from './context/ContentContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ContentProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ContentProvider>
    </ThemeProvider>
  </StrictMode>
);
