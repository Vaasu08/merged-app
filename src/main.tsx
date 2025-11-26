import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Performance: Mark app initialization start
if (typeof performance !== 'undefined' && performance.mark) {
  performance.mark('app-init-start');
}

// Defer non-critical work using requestIdleCallback
const deferWork = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 100);
  }
};

// Register service worker in background
deferWork(() => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA is optional
    });
  }
});

// Preload critical chunks after initial render
deferWork(() => {
  // Hint browser to preload likely next pages
  const likelyRoutes = ['/profile', '/resume', '/interview'];
  likelyRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    link.as = 'document';
    document.head.appendChild(link);
  });
});

// Error handling for root mounting
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure index.html has a div with id='root'");
}

try {
  // Clear loading spinner
  rootElement.innerHTML = '';
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  // Performance: Mark app initialization complete
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('app-init-end');
    performance.measure('app-init', 'app-init-start', 'app-init-end');
  }
} catch (error) {
  console.error("Failed to render app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: system-ui; text-align: center;">
      <h1 style="color: #ef4444;">Application Failed to Load</h1>
      <p>Please refresh the page or contact support if the problem persists.</p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">Error: ${error instanceof Error ? error.message : String(error)}</p>
    </div>
  `;
}
