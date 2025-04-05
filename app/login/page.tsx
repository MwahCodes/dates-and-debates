'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, supabase, isLoading: authLoading } = useAuth();
  const redirectAttemptedRef = useRef(false);
  
  // If already authenticated, redirect to home
  useEffect(() => {
    // Skip if already redirecting or still loading auth
    if (redirectAttemptedRef.current || authLoading) return;
    
    if (user) {
      console.log('User already authenticated, redirecting to home');
      redirectAttemptedRef.current = true;
      
      // Use timeout to avoid react state updates during render
      setTimeout(() => {
        router.push('/home');
      }, 100);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submitting while loading or if already redirecting
    if (isLoading || redirectAttemptedRef.current) return;
    
    setError(null);
    setIsLoading(true);

    try {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user returned from authentication');
      }

      console.log('Authentication successful');
      
      // Fetch user profile to check if it's complete
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, birthday')
        .eq('id', data.user.id)
        .single();
      
      // Mark as redirecting to prevent duplicate redirects
      redirectAttemptedRef.current = true;
      
      // Handle profile completion check
      if (userError) {
        if (userError.code === 'PGRST116') {
          // No user record exists - redirect to profile setup
          toast.info('Please complete your profile setup');
          setTimeout(() => {
            router.push('/profile-setup');
          }, 100);
          return;
        }
        console.error('Error fetching user profile:', userError);
      } else if (!userData.name || !userData.birthday) {
        // Incomplete profile - redirect to profile setup
        toast.info('Please complete your profile');
        setTimeout(() => {
          router.push('/profile-setup');
        }, 100);
        return;
      }
      
      // Success - authenticate and redirect
      toast.success('Login successful');
      
      // Use timeout to avoid React state updates during render
      setTimeout(() => {
        router.push('/home');
      }, 100);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      toast.error(err instanceof Error ? err.message : 'Login failed');
      redirectAttemptedRef.current = false; // Reset redirect flag on error
    } finally {
      setIsLoading(false);
    }
  };

  // If still checking auth state, show loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // If user is already logged in, don't render the form
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Redirecting to home...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed title section */}
      <div className="w-full pt-12 px-8">
        <h1 className="text-3xl font-hannari text-center text-[#1A1A1A] tracking-tight">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-[#666666]">
          Sign in to continue your journey
        </p>
      </div>

      {/* Content section */}
      <div className="px-8 mt-8">
        <div className="max-w-md mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-[#E0E0E0] text-[#1A1A1A] placeholder:text-[#666666]"
                />
              </div>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-[#E0E0E0] text-[#1A1A1A] placeholder:text-[#666666]"
                />
              </div>
            </div>

            {error && (
              <div className="text-[#F44336] text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#6C0002] text-white hover:bg-[#8C0003] shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 