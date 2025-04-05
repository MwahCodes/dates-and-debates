'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const educationLevels = [
  "High School",
  "Some College",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Degree",
  "Trade School",
  "Other"
];

const generateHeightOptions = () => {
  const options = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      if (feet === 7 && inches > 0) break;
      options.push({
        value: `${feet}'${inches}"`,
        label: `${feet}'${inches}"`,
        total: feet * 12 + inches
      });
    }
  }
  return options;
};

const generateWeightOptions = () => {
  const options = [];
  for (let weight = 80; weight <= 300; weight += 5) {
    options.push({
      value: weight.toString(),
      label: `${weight} lbs`
    });
  }
  return options;
};

const personalityTypes = [
  { code: 'INTJ', title: 'THE ARCHITECT' },
  { code: 'INTP', title: 'THE LOGICIAN' },
  { code: 'ENTJ', title: 'THE COMMANDER' },
  { code: 'ENTP', title: 'THE DEBATER' },
  { code: 'INFJ', title: 'THE ADVOCATE' },
  { code: 'INFP', title: 'THE MEDIATOR' },
  { code: 'ENFJ', title: 'THE PROTAGONIST' },
  { code: 'ENFP', title: 'THE CAMPAIGNER' },
  { code: 'ISTJ', title: 'THE LOGISTICIAN' },
  { code: 'ISFJ', title: 'THE DEFENDER' },
  { code: 'ESTJ', title: 'THE EXECUTIVE' },
  { code: 'ESFJ', title: 'THE CONSUL' },
  { code: 'ISTP', title: 'THE VIRTUOSO' },
  { code: 'ISFP', title: 'THE ADVENTURER' },
  { code: 'ESTP', title: 'THE ENTREPRENEUR' },
  { code: 'ESFP', title: 'THE ENTERTAINER' }
];

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [education, setEducation] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [mbtiType, setMbtiType] = useState('');

  const heightOptions = generateHeightOptions();
  const weightOptions = generateWeightOptions();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    if (value.length >= 4) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
    } else if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    setDateInput(value);
  };

  const isValidDate = () => {
    if (!dateInput) return false;
    const parts = dateInput.split('/');
    if (parts.length !== 3) return false;
    
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && 
           date.getDate() === day && 
           date.getFullYear() === year &&
           date >= new Date(1900, 0, 1) && 
           date <= new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!isValidDate()) {
        throw new Error('Please enter a valid date');
      }

      if (!name || !education || !height || !weight) {
        throw new Error('Please fill in all required fields');
      }

      // Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            birthday: dateInput,
            education_level: education,
            height: parseInt(height.split("'")[0]) * 12 + parseInt(height.split("'")[1].replace('"', '')),
            weight: parseInt(weight),
            mbti_type: mbtiType || null,
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user?.id) {
        throw new Error('Failed to create user account');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          name,
          birthday: dateInput,
          education_level: education,
          height: parseInt(height.split("'")[0]) * 12 + parseInt(height.split("'")[1].replace('"', '')),
          weight: parseInt(weight),
          mbti_type: mbtiType || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile. Please try again.');
      }

      // Show success message and redirect
      setError(null);
      alert('Account created successfully! Please check your email to verify your account before signing in.');
      router.push('/auth');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full pt-12 px-8">
        <h1 className="text-3xl font-semibold text-center text-[#1A1A1A]">
          Create your account
        </h1>
      </div>

      <div className="px-8 mt-8 pb-8">
        <div className="max-w-md mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Authentication Section */}
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
                  placeholder="Create a password"
                  className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-lg font-medium text-[#1A1A1A]">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
                />
              </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-lg font-medium text-[#1A1A1A]">
                  Preferred Name
                </label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your preferred name"
                  className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="birthday" className="text-lg font-medium text-[#1A1A1A]">
                  Birthday
                </label>
                <Input
                  id="birthday"
                  required
                  value={dateInput}
                  onChange={handleDateChange}
                  placeholder="MM/DD/YYYY"
                  className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium text-[#1A1A1A]">
                  Education Level
                </label>
                <Select required value={education} onValueChange={setEducation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium text-[#1A1A1A]">
                  Height
                </label>
                <Select required value={height} onValueChange={setHeight}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your height" />
                  </SelectTrigger>
                  <SelectContent>
                    {heightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium text-[#1A1A1A]">
                  Weight
                </label>
                <Select required value={weight} onValueChange={setWeight}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {weightOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium text-[#1A1A1A]">
                  MBTI Type (Optional)
                </label>
                <Select value={mbtiType} onValueChange={setMbtiType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your MBTI type" />
                  </SelectTrigger>
                  <SelectContent>
                    {personalityTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.code} - {type.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#6C0002] text-white py-6 rounded-lg text-lg hover:bg-[#8C0003] transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/auth')}
                className="text-[#666666] hover:text-[#6C0002] transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 