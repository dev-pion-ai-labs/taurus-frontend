'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Network,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/use-auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Consultations', href: '/dashboard#sessions', icon: ClipboardList },
  { label: 'Company Profile', href: '/company-profile', icon: Building2 },
  { label: 'Departments', href: '/departments', icon: Network },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Templates', href: '/admin/templates', icon: FileText, adminOnly: true },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const isActive = (href: string) => {
    if (href === '/dashboard#sessions') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : 'User';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-white border-r border-[#E7E5E4]
          transition-transform duration-200 ease-in-out
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6">
          <span className="text-[20px] font-bold text-[#1C1917]">Taurus</span>
          <button
            type="button"
            className="md:hidden rounded-lg p-1 text-[#78716C] hover:bg-[#FAFAF9]"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              if (item.adminOnly && user?.role !== 'ADMIN') return null;

              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isOpen) onToggle();
                    }}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                      transition-colors duration-150
                      ${
                        active
                          ? 'bg-[#FFF1F2] text-[#E11D48]'
                          : 'text-[#78716C] hover:bg-[#FAFAF9]'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="mt-auto px-3 pb-4">
          <Separator className="mb-4" />
          <div className="flex flex-col gap-3 px-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#1C1917]">
                {displayName}
              </p>
              <p className="truncate text-xs text-[#78716C]">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#78716C] transition-colors duration-150 hover:bg-[#FAFAF9] disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {logout.isPending ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
