/**
 * Secure Storage Adapter for Supabase Auth
 * 
 * This adapter provides a more secure storage mechanism than localStorage
 * by using sessionStorage for tokens (cleared on tab close) and adding
 * additional security measures.
 * 
 * Note: For maximum security, consider using httpOnly cookies via an
 * edge function proxy, but this requires backend changes.
 */

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class SecureStorageAdapter implements StorageAdapter {
  private prefix = 'sb-';
  
  getItem(key: string): string | null {
    try {
      // Use sessionStorage for tokens (cleared on tab close)
      // This reduces risk of XSS attacks persisting across sessions
      if (key.includes('token') || key.includes('session')) {
        const value = sessionStorage.getItem(this.prefix + key);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secureStorage.ts:getItem',message:'Reading token from sessionStorage',data:{key,hasValue:!!value,storageType:'sessionStorage'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return value;
      }
      // Use localStorage for non-sensitive data
      const value = localStorage.getItem(this.prefix + key);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secureStorage.ts:getItem',message:'Reading non-token from localStorage',data:{key,hasValue:!!value,storageType:'localStorage'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return value;
    } catch (error) {
      console.error('Storage getItem error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secureStorage.ts:getItem',message:'Storage getItem error',data:{key,error:error instanceof Error ? error.message : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (key.includes('token') || key.includes('session')) {
        sessionStorage.setItem(this.prefix + key, value);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secureStorage.ts:setItem',message:'Writing token to sessionStorage',data:{key,valueLength:value.length,storageType:'sessionStorage'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } else {
        localStorage.setItem(this.prefix + key, value);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secureStorage.ts:setItem',message:'Writing non-token to localStorage',data:{key,valueLength:value.length,storageType:'localStorage'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/e5d437f1-f68d-44ce-9e0c-542a5ece8b0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'secureStorage.ts:setItem',message:'Storage setItem error',data:{key,error:error instanceof Error ? error.message : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(this.prefix + key);
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
}

export const secureStorage = new SecureStorageAdapter();

/**
 * Alternative: For maximum security, use httpOnly cookies
 * This requires creating an edge function proxy that:
 * 1. Receives auth requests from client
 * 2. Forwards to Supabase with service role key
 * 3. Sets httpOnly cookies for tokens
 * 4. Client reads cookies automatically (not accessible to JS)
 * 
 * See: https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */

