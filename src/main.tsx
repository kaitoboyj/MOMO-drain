import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Polyfill Node's Buffer for browser runtime (fixes production ReferenceError)
import { Buffer } from "buffer";
// Ensure Buffer is available globally for libraries expecting Node globals
// Without this, Netlify/production build can crash with "Buffer is not defined"
// on certain wallet adapters or crypto utilities.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (!(globalThis as any).Buffer) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (globalThis as any).Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(<App />);
