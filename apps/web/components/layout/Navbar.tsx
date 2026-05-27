'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() || '';

  // Compute page title based on path
  const getPageTitle = () => {
    if (pathname === '/create') return 'Create Assignment';
    if (pathname.startsWith('/assignments/')) return 'Assignment Detail';
    if (pathname === '/assignments') return 'Assignments';
    return 'Assignment';
  };

  const handleBack = () => {
    if (pathname === '/') {
      return;
    }
    router.back();
  };

  return (
    <header className="mb-6 flex items-center justify-between rounded-2xl bg-white px-6 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#e5e5e5]">
      {/* Back and Page Name */}
      <div className="flex items-center gap-4">
        {pathname !== '/' && (
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#707070] transition-all hover:bg-[#f3f3f3] hover:text-[#2d2d2d]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4.5 w-4.5 text-[#707070]" />
          <span className="text-sm font-bold text-[#707070]">{getPageTitle()}</span>
        </div>
      </div>

      {/* Action panel (Bell + Profile) */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#2d2d2d] transition-all hover:bg-[#f3f3f3]">
          <Bell className="h-4.5 w-4.5" />
          {/* Active notification indicator */}
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#e05a36]" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white py-1 pl-1 pr-3 shadow-sm cursor-pointer hover:bg-[#f9f9f9] transition-all">
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[#e5e5e5] bg-[#efefef]">
            <Image
              src="/school_mascot.png" // Fallback to mascot or standard avatar
              alt="John Doe"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs font-black text-[#2d2d2d]">John Doe</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#707070]" />
        </div>
      </div>
    </header>
  );
}
