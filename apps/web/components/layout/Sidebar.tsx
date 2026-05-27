'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Home, Users, FileText, Wrench, BookOpen, Settings } from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  assignmentsCount?: number;
}

export default function Sidebar({ assignmentsCount = 10 }: SidebarProps) {
  const pathname = usePathname() || '';
  const router = useRouter();

  const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/groups', label: 'My Groups', icon: Users },
    {
      href: '/assignments',
      label: 'Assignments',
      icon: FileText,
      badge: assignmentsCount > 0 ? assignmentsCount : undefined,
    },
    { href: '/toolkit', label: 'AI Teacher\'s Toolkit', icon: Wrench },
    { href: '/library', label: 'My Library', icon: BookOpen, badge: 32 },
  ];

  const handleCreateClick = () => {
    router.push('/create');
  };

  return (
    <aside className="fixed bottom-4 left-4 top-4 flex w-72 flex-col rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#e5e5e5]">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e05a36] to-[#f07b5a] text-white shadow-[0_4px_12px_rgba(224,90,54,0.3)]">
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2zm0 3.99L18.47 19H5.53L12 5.99zM11 11v4h2v-4h-2zm0 6v2h2v-2h-2z" />
          </svg>
        </div>
        <span className="text-2xl font-black tracking-tight text-[#2d2d2d]">
          Veda<span className="text-[#e05a36]">AI</span>
        </span>
      </div>

      {/* Sparkle Create Button */}
      <button
        onClick={handleCreateClick}
        className="group mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#2d2d2d] py-3.5 text-sm font-bold text-white transition-all hover:bg-black shadow-[0_0_20px_rgba(224,90,54,0.25)] border-2 border-[#e05a36]/80 hover:shadow-[0_0_25px_rgba(224,90,54,0.4)]"
      >
        <Sparkles className="h-4.5 w-4.5 text-[#e05a36] group-hover:scale-110 transition-transform" />
        Create Assignment
      </button>

      {/* Menu Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#f3f3f3] text-[#2d2d2d] shadow-sm'
                  : 'text-[#707070] hover:bg-[#f9f9f9] hover:text-[#2d2d2d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#e05a36]' : 'text-[#707070]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="rounded-full bg-[#e05a36] px-2.5 py-0.5 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer block (Settings + Mascot Card) */}
      <div className="space-y-4 pt-4 border-t border-[#f0f0f0]">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            pathname === '/settings'
              ? 'bg-[#f3f3f3] text-[#2d2d2d]'
              : 'text-[#707070] hover:bg-[#f9f9f9] hover:text-[#2d2d2d]'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>

        {/* Profile Mascot Card */}
        <div className="flex items-center gap-3 rounded-2xl bg-[#efefef] p-3 border border-[#e5e5e5]">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white border border-[#e5e5e5]">
            <Image
              src="/school_mascot.png"
              alt="Delhi Public School"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-xs font-black text-[#2d2d2d]">
              Delhi Public School
            </h4>
            <p className="truncate text-[10px] font-semibold text-[#707070]">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
