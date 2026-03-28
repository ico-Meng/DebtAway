'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { userManager } from '@/types/index';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only guard sub-routes — /dashboard itself handles its own auth flow
    if (pathname === '/dashboard') return;

    const checkAuth = async () => {
      try {
        const user = await userManager.getUser();
        if (!user || user.expired) {
          router.replace('/dashboard');
        }
      } catch {
        router.replace('/dashboard');
      }
    };

    checkAuth();
  }, [pathname, router]);

  return <>{children}</>;
}
