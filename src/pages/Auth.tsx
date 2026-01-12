import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useErrorModal } from '@/components/wellwell/ErrorModal';
import { logger } from '@/lib/logger';
import wellwellIcon from '@/assets/wellwell-icon.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const navigate = useNavigate();
  const { user, signUp, signIn, signInWithOAuth, loading, configError } = useAuth();
  const { showError, ErrorModal } = useErrorModal();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      logger.info('User already logged in, redirecting');
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    logger.interaction(isLogin ? 'Login form submit' : 'Signup form submit');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          // Generic error message to prevent account enumeration
          showError(
            'Invalid email or password. Please try again.',
            'Sign in failed'
          );
          return;
        }
        navigate('/');
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          // Generic error message - don't reveal if email exists
          let message = 'Unable to create account. Please try again.';
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            message = 'This email may already be registered. Try signing in instead.';
          } else if (error.message.includes('password')) {
            message = error.message; // Password errors are safe to show
          }
          showError(message, 'Sign up failed');
          return;
        }
        navigate('/onboarding');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show configuration error if present
  if (configError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="p-4 bg-destructive/10 rounded-xl">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Configuration Error
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {configError.message}
            </p>
            <p className="text-xs text-muted-foreground">
              Please check your environment variables and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {ErrorModal}
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        {/* Background glow */}
        <div className="fixed inset-0 bg-glow-gradient opacity-50 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <img src={wellwellIcon} alt="WellWell" className="h-14 w-14" />
          <p className="text-muted-foreground text-center">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="How should we call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              className="bg-secondary/50 border-border/50"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              className="bg-secondary/50 border-border/50"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={async () => {
            const { error } = await signInWithOAuth('google');
            if (error) {
              showError(
                'Unable to sign in with Google. Please try again.',
                'Google sign in failed'
              );
            }
          }}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
