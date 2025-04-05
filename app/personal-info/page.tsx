'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function PersonalInfo() {
  const router = useRouter();
  const [dateInput, setDateInput] = useState<string>('');
  const [isValidDate, setIsValidDate] = useState<boolean>(false);
  const [name, setName] = useState<string>('');

  const formatDateInput = (value: string): string => {
    // Remove any non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Add slashes after MM and DD
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return numbers.slice(0, 2) + '/' + numbers.slice(2);
    return numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
  };

  const validateDate = (value: string): boolean => {
    const dateStr = value.replace(/\D/g, '');
    if (dateStr.length !== 8) return false;

    const month = parseInt(dateStr.slice(0, 2));
    const day = parseInt(dateStr.slice(2, 4));
    const year = parseInt(dateStr.slice(4));

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;

    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    if (formatted.length <= 10) { // MM/DD/YYYY = 10 characters
      setDateInput(formatted);
    }
  };

  useEffect(() => {
    setIsValidDate(validateDate(dateInput));
  }, [dateInput]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold text-center text-[#1A1A1A]">
            Personal Information
          </h1>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-lg font-medium text-[#1A1A1A]">
                My preferred name is
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
              />
              <p className="text-sm text-[#666666]">
                This is how it will appear in Dates and Debates.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-lg font-medium text-[#1A1A1A]">
                My birthday is
              </label>
              <div className="relative">
                <Input
                  value={dateInput}
                  onChange={handleDateChange}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  className={`w-full p-3 rounded-lg border ${
                    dateInput && !isValidDate 
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]'
                  }`}
                />
                {dateInput && !isValidDate && (
                  <p className="text-sm text-red-500 mt-1">
                    Please enter a valid date in MM/DD/YYYY format
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-[#6C0002] text-white py-6 rounded-lg mt-8 text-lg hover:bg-[#8C0003] transition-colors"
            disabled={!name || (Boolean(dateInput) && !isValidDate)}
            onClick={() => router.push('/physical-attributes')}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
} 