'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <ProtectedRoute requireOrg={true}>
      <div className="min-h-screen bg-[#F5F5F4]">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center border-b border-[#E7E5E4] bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#FAFAF9]"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-[16px] font-bold text-[#1C1917]">
            Taurus
          </span>
        </div>

        {/* Main content */}
        <main className="min-h-screen md:ml-64">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
