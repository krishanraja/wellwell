/**
 * Unit tests for ProtectedRoute component
 * 
 * Tests route guard logic, redirects, and loading states
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '@/hooks/useAuth';

// Mock useAuth hook
vi.mock('@/hooks/useAuth', async () => {
  const actual = await vi.importActual('@/hooks/useAuth');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('ProtectedRoute', () => {
  it('should show loading spinner when auth is loading', () => {
    const { useAuth } = await import('@/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      sessionExpired: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      deleteAccount: vi.fn(),
      refreshSession: vi.fn(),
      dismissSessionExpired: vi.fn(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    // Should show loading spinner
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to landing when user is not authenticated', () => {
    const { useAuth } = await import('@/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      sessionExpired: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      deleteAccount: vi.fn(),
      refreshSession: vi.fn(),
      dismissSessionExpired: vi.fn(),
    });

    // TODO: Test redirect behavior
    // This requires mocking useNavigate
  });

  it('should render children when user is authenticated', () => {
    const { useAuth } = await import('@/hooks/useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      session: { access_token: 'token' },
      loading: false,
      sessionExpired: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      deleteAccount: vi.fn(),
      refreshSession: vi.fn(),
      dismissSessionExpired: vi.fn(),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});


