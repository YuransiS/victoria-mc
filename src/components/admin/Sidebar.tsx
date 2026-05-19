'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, BarChart3, Settings, LogOut, Shield, User, Menu, X
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';

interface SidebarProps {
  role: 'OP' | 'SALES' | 'DEVELOPER';
  username: string;
}

export default function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = '/login';
  };

  const getRoleLabel = (r: string) => {
    if (r === 'OP') return 'Операційний продюсер';
    if (r === 'SALES') return 'Відділ продажів';
    if (r === 'DEVELOPER') return 'Розробник';
    return r;
  };

  const navItems = [
    {
      name: 'Аналітика',
      href: '/admin/analytics',
      icon: BarChart3,
      roles: ['OP', 'DEVELOPER'],
      exact: true,
    },
    {
      name: 'База лідів',
      href: '/admin/leads',
      icon: Users,
      roles: ['OP', 'SALES', 'DEVELOPER'],
      exact: false,
    },
    {
      name: 'Налаштування',
      href: '/admin/settings',
      icon: Settings,
      roles: ['OP', 'DEVELOPER'],
      exact: false,
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0E0E11] border-r border-white/5 py-8 px-6 selection:bg-[#C4A47C]/30 text-white">
      {/* Brand Header */}
      <div className="mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A47C]/20 to-black border border-[#C4A47C]/30 flex items-center justify-center">
          <Shield className="text-[#C4A47C] w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white leading-none">CRM Panel</h2>
          <span className="text-[10px] text-white/30 tracking-[0.2em] font-bold uppercase">Victoria MC</span>
        </div>
      </div>

      {/* User Session Info */}
      <div className="mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#C4A47C]/10 border border-[#C4A47C]/20 flex items-center justify-center text-[#C4A47C] font-bold text-xs uppercase">
          {username ? username.charAt(0) : 'U'}
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold truncate text-white">{username || 'Користувач'}</p>
          <p className="text-[9px] text-[#C4A47C] font-bold uppercase tracking-wider truncate">
            {getRoleLabel(role)}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold pl-2 mb-4">Навігація</p>
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-[#C4A47C]/20 to-transparent border-l-2 border-[#C4A47C] text-white' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#C4A47C]' : 'text-white/40'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto border-t border-white/5 pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
        >
          <LogOut size={16} />
          Вийти з системи
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-[#0E0E11] border border-white/5 rounded-xl text-[#C4A47C] active:scale-95 transition-all shadow-lg"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40" 
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>
    </>
  );
}
