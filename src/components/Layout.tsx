'use client';

import { Sidebar } from './Sidebar';
import { AuthGuard } from './AuthGuard';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Sidebar />
        <main className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
