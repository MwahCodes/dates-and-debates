'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ProfileSetupPage() {
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    education_level: '',
    height: '',
    weight: '',
    mbti_type: '',
  });
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

      toast.success('Profile created successfully!');
      router.push('/home');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred while creating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, education_level: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full pt-12 px-8">
        <h1 className="text-3xl font-semibold text-center text-[#1A1A1A]">
          Complete Your Profile
        </h1>
      </div>

      <div className="px-8 mt-8">
        <div className="max-w-md mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My name is</h2>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#666666] h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My birthday is</h2>
              <Input
                id="birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                required
                className="bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#666666] h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My education level is</h2>
              <Select value={formData.education_level} onValueChange={handleSelectChange}>
                <SelectTrigger className="bg-[#F5F5F5] border-0 text-[#1A1A1A] h-14 text-lg">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="Doctorate">Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My height is</h2>
              <Input
                id="height"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                placeholder="Enter your height in inches"
                required
                min="0"
                step="0.1"
                className="bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#666666] h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My weight is</h2>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter your weight in pounds"
                required
                min="0"
                step="0.1"
                className="bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#666666] h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl text-[#1A1A1A]">My MBTI type is</h2>
              <Input
                id="mbti_type"
                name="mbti_type"
                value={formData.mbti_type}
                onChange={handleChange}
                placeholder="e.g., INTJ"
                maxLength={4}
                className="bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#666666] h-14 text-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#6C0002] text-white h-14 text-lg hover:bg-[#8C0003] mt-8"
              disabled={loading}
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 