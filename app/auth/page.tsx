'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const createUserProfile = async (userId: string, userData: any) => {
    try {
      // Check if user profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return; // Profile already exists, no need to create
      }

      // Create new user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: userData.name,
          birthday: userData.birthday,
          education_level: userData.education_level,
          height: userData.height,
          weight: userData.weight,
          mbti_type: userData.mbti_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile');
      }
    } catch (err) {
      console.error('Error in createUserProfile:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      if (!signInData.user) {
        throw new Error('No user data returned');
      }

      // If user has metadata (means they just signed up), create their profile
      if (signInData.user.user_metadata && Object.keys(signInData.user.user_metadata).length > 0) {
        await createUserProfile(signInData.user.id, signInData.user.user_metadata);
      }

      router.push('/home');
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full pt-12 px-8">
        <h1 className="text-3xl font-semibold text-center text-[#1A1A1A]">
          Sign in to your account
        </h1>
      </div>

      <div className="px-8 mt-8">
        <div className="max-w-md mx-auto space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-lg font-medium text-[#1A1A1A]">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-lg font-medium text-[#1A1A1A]">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full bg-[#6C0002] text-white py-6 rounded-lg text-lg hover:bg-[#8C0003] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/signup')}
                  className="text-[#666666] hover:text-[#6C0002] transition-colors"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 