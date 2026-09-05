import React from 'react';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { NetworkStatusBanner } from '@/components/feedback/NetworkStatusBanner';
import { DealFlowDoodleBackground } from './DealFlowDoodleBackground';

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

        {/* Scrollable content with WhatsApp-style subtle project doodle wallpaper */}
        <main className="relative flex-1 overflow-y-auto bg-background/70 p-5 focus:outline-none">
          <DealFlowDoodleBackground opacity={0.06} />
          <div className="relative z-10 max-w-[1400px] mx-auto w-full space-y-1">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
