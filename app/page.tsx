'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full pt-12 px-8">
        <h1 className="text-[32px] leading-tight font-hannari text-center">
          <span className="text-black">Welcome to</span>
          <div className="mt-2">
            <span className="text-[#FF9E80]">Dates</span>
            <span className="text-black">&</span>
            <span className="text-[#6C0002]">Debates</span>
          </div>
        </h1>
        
        <h2 className="text-[24px] text-[#1A1A1A] leading-relaxed text-center mt-4">
          Please follow these house rules
        </h2>
      </div>

      <div className="px-8 mt-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-start space-x-4">
            <div className="text-[#6C0002]">✓</div>
            <div>
              <h3 className="text-[20px] font-medium text-[#1A1A1A]">Be yourself</h3>
              <p className="text-[16px] text-[#666666] mt-1">
                Ensure that your profile is representative of yourself, match accuracy may be affected otherwise.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="text-[#6C0002]">✓</div>
            <div>
              <h3 className="text-[20px] font-medium text-[#1A1A1A]">Be mindful of your data</h3>
              <p className="text-[16px] text-[#666666] mt-1">
                Do not share passwords or other potentially sensitive data
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="text-[#6C0002]">✓</div>
            <div>
              <h3 className="text-[20px] font-medium text-[#1A1A1A]">Be respectful</h3>
              <p className="text-[16px] text-[#666666] mt-1">
                While engaging with other users, be respectful, harassment is not tolerated
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="text-[#6C0002]">✓</div>
            <div>
              <h3 className="text-[20px] font-medium text-[#1A1A1A]">Follow D&D Terms of Service</h3>
              <p className="text-[16px] text-[#666666] mt-1">
                By using this application, you agree to follow the{' '}
                <a href="/terms" className="text-[#2196F3] hover:underline">
                  Terms of Service
                </a>
              </p>
            </div>
          </div>

          <Button 
            className="w-full bg-[#6C0002] text-white py-6 rounded-lg mt-8 text-lg hover:bg-[#8C0003] transition-colors"
            onClick={() => router.push('/login')}
          >
            I Agree
          </Button>
        </div>
      </div>
    </div>
  );
}
