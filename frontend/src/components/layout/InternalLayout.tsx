import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from './AppShell';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { PageSkeleton } from '@/components/feedback/PageSkeleton';

export function InternalLayout() {
  return (
    <AppShell>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
