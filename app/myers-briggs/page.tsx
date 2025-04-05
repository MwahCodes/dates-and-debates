'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { X } from "lucide-react";

const personalityTypes = [
  { code: 'INTJ', title: 'THE ARCHITECT', traits: 'IMAGINATIVE STRATEGIC PLANNERS' },
  { code: 'INTP', title: 'THE LOGICIAN', traits: 'INNOVATIVE CURIOUS LOGICAL' },
  { code: 'ENTJ', title: 'THE COMMANDER', traits: 'BOLD IMAGINATIVE STRONG-WILLED' },
  { code: 'ENTP', title: 'THE DEBATER', traits: 'SMART CURIOUS INTELLECTUAL' },
  { code: 'INFJ', title: 'THE ADVOCATE', traits: 'QUIET MYSTICAL IDEALIST' },
  { code: 'INFP', title: 'THE MEDIATOR', traits: 'POETIC KIND ALTRUISTIC' },
  { code: 'ENFJ', title: 'THE PROTAGONIST', traits: 'CHARISMATIC INSPIRING NATURAL LEADERS' },
  { code: 'ENFP', title: 'THE CAMPAIGNER', traits: 'ENTHUSIASTIC CREATIVE SOCIABLE' },
  { code: 'ISTJ', title: 'THE LOGISTICIAN', traits: 'PRACTICAL FACT-MINDED RELIABLE' },
  { code: 'ISFJ', title: 'THE DEFENDER', traits: 'PROTECTIVE WARM CARING' },
  { code: 'ESTJ', title: 'THE EXECUTIVE', traits: 'ORGANIZED PUNCTUAL LEADER' },
  { code: 'ESFJ', title: 'THE CONSUL', traits: 'CARING SOCIAL POPULAR' },
  { code: 'ISTP', title: 'THE VIRTUOSO', traits: 'BOLD PRACTICAL EXPERIMENTAL' },
  { code: 'ISFP', title: 'THE ADVENTURER', traits: 'ARTISTIC CHARMING EXPLORERS' },
  { code: 'ESTP', title: 'THE ENTREPRENEUR', traits: 'SMART ENERGETIC PERCEPTIVE' },
  { code: 'ESFP', title: 'THE ENTERTAINER', traits: 'SPONTANEOUS ENERGETIC ENTHUSIASTIC' }
];

export default function MyersBriggs() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredTypes = personalityTypes.filter(type => 
    type.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      setIsDropdownOpen(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-center text-[#1A1A1A]">
              Myers Briggs test (optional)
            </h1>
            <p className="mt-2 text-center text-[#666666]">
              Let everyone know what your Myers Briggs personality test.
            </p>
          </div>

          <div className="relative dropdown-container">
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Type your type"
              className="w-full p-3 rounded-lg border border-[#E0E0E0] focus:border-[#6C0002] focus:ring-1 focus:ring-[#6C0002]"
            />
            
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredTypes.map((type) => (
                  <div
                    key={type.code}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedType(type.code);
                      setSearchTerm('');
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="font-medium">{type.code}</span>
                    <span className="text-[#666666]">{type.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedType && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">•</span>
                <span className="font-medium">{selectedType}</span>
                <span className="ml-2 text-[#666666]">
                  {personalityTypes.find(t => t.code === selectedType)?.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedType(null)}
                className="text-[#666666] hover:text-[#6C0002] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <Button 
              className="w-full bg-[#6C0002] text-white py-6 rounded-lg text-lg hover:bg-[#8C0003] transition-colors"
              onClick={() => router.push('/next-page')}
            >
              Continue
            </Button>
            
            <button
              onClick={() => router.push('/next-page')}
              className="w-full text-center text-[#666666] hover:text-[#6C0002] transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 