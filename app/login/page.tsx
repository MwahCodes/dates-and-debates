'use client';

import { useState } from 'react';
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
  const { supabase } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error(authError.message);
      }

      if (!authData?.user?.id) {
        throw new Error('No user ID returned from authentication');
      }

      // Step 2: Check user in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('User fetch error:', userError);
        
        if (userError.code === 'PGRST116') {
          // No user exists in the users table, redirect to profile setup
          toast.info('Please complete your profile setup');
          router.push(`/profile-setup?userId=${authData.user.id}`);
          return;
        }
        
        throw new Error('Error fetching user data');
      }

      // Step 3: Check if user has completed their profile
      if (!userData.name || !userData.birthday) {
        // User exists but profile is incomplete
        toast.info('Please complete your profile information');
        router.push(`/profile-setup?userId=${authData.user.id}`);
        return;
      }

      // Step 4: Successful login with complete profile
      toast.success('Successfully signed in');
      router.push(`/home?userId=${authData.user.id}`);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      toast.error(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

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