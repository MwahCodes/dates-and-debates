'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { supabase } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has a profile in the users table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile exists, redirect to profile setup
          router.push('/profile-setup');
        } else {
          throw profileError;
        }
      } else if (!profileData) {
        // No profile exists, redirect to profile setup
        router.push('/profile-setup');
      } else {
        // Profile exists, go to home
        router.push('/home');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My email is</h2>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#666666] h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My password is</h2>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#666666] h-14 text-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6C0002] text-white h-14 text-lg hover:bg-[#8C0003] mt-8"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 