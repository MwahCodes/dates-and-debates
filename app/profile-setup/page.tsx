'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfileSetupPage() {
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    education_level: '',
    height: '',
    weight: '',
    mbti_type: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, supabase } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Convert height from feet/inches to inches
      const heightInInches = parseFloat(formData.height);
      if (isNaN(heightInInches) || heightInInches <= 0) {
        throw new Error('Please enter a valid height');
      }

      // Convert weight to number
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0) {
        throw new Error('Please enter a valid weight');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user?.id,
          name: formData.name,
          birthday: formData.birthday,
          education_level: formData.education_level,
          height: heightInInches,
          weight: weight,
          mbti_type: formData.mbti_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-foreground mb-1">
              Birthday
            </label>
            <Input
              id="birthday"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="education_level" className="block text-sm font-medium text-foreground mb-1">
              Education Level
            </label>
            <select
              id="education_level"
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select education level</option>
              <option value="High School">High School</option>
              <option value="Associate's Degree">Associate's Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate">Doctorate</option>
            </select>
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-foreground mb-1">
              Height (inches)
            </label>
            <Input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              placeholder="Enter your height in inches"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-1">
              Weight (lbs)
            </label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Enter your weight in pounds"
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="mbti_type" className="block text-sm font-medium text-foreground mb-1">
              MBTI Type (Optional)
            </label>
            <Input
              id="mbti_type"
              name="mbti_type"
              value={formData.mbti_type}
              onChange={handleChange}
              placeholder="e.g., INTJ"
              maxLength={4}
              className="w-full"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
} 