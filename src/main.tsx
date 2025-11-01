import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Error handling for root mounting
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure index.html has a div with id='root'");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
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
