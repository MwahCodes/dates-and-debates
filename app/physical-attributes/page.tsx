'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
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
  // Generate heights from 4'0" to 7'0"
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      // Stop at 7'0"
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
  // Generate weights from 80 to 400 pounds
  for (let weight = 80; weight <= 400; weight += 1) {
    options.push({
      value: weight.toString(),
      label: `${weight} lbs`,
      weight
    });
  }
  return options;
};

export default function PhysicalAttributes() {
  const router = useRouter();
  const [education, setEducation] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  const heightOptions = generateHeightOptions();
  const weightOptions = generateWeightOptions();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full pt-12 px-8">
        <h1 className="text-3xl font-semibold text-center text-[#1A1A1A]">
          Physical Attributes
        </h1>
      </div>

      <div className="px-8 mt-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-lg font-medium text-[#1A1A1A]">
              My education level is
            </label>
            <Select value={education} onValueChange={setEducation}>
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
              My height is
            </label>
            <Select value={height} onValueChange={setHeight}>
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
              My weight is
            </label>
            <Select value={weight} onValueChange={setWeight}>
              <SelectTrigger>
                <SelectValue placeholder="Select your weight" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {weightOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full bg-[#6C0002] text-white py-6 rounded-lg mt-8 text-lg hover:bg-[#8C0003] transition-colors"
            disabled={!education || !height || !weight}
            onClick={() => router.push('/myers-briggs')}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
} 