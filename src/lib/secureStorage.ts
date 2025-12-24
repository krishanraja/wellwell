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
        return value;
      }
      // Use localStorage for non-sensitive data
      const value = localStorage.getItem(this.prefix + key);
      return value;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (key.includes('token') || key.includes('session')) {
        sessionStorage.setItem(this.prefix + key, value);
      } else {
        localStorage.setItem(this.prefix + key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
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

