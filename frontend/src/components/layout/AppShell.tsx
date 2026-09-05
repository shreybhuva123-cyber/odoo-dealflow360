import React from 'react';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { NetworkStatusBanner } from '@/components/feedback/NetworkStatusBanner';

export interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <NetworkStatusBanner />
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top navigation bar */}
        <TopNavbar />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-background/60 p-5 focus:outline-none">
          <div className="max-w-[1400px] mx-auto w-full space-y-1">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
