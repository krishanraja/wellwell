import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// #region agent log - Global error handlers
window.addEventListener('error', (event) => {
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:globalErrorHandler',message:'Unhandled error caught',data:{message:event.message,filename:event.filename,lineno:event.lineno,colno:event.colno,error:event.error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
});

window.addEventListener('unhandledrejection', (event) => {
  fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:unhandledRejection',message:'Unhandled promise rejection',data:{reason:event.reason?.message || String(event.reason)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'E'})}).catch(()=>{});
});
// #endregion

createRoot(document.getElementById("root")!).render(<App />);
