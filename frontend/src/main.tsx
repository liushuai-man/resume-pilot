import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles/global.css';
import './styles/editor.css';
import App from './App';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';

function ThemedApp() {
  const { colorScheme } = useTheme();
  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
