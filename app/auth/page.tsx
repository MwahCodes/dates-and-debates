'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/home');
    } catch (err) {
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