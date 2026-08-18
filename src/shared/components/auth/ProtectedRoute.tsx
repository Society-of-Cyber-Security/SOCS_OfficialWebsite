"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/core/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not logged in, redirect to login
      router.push(`/login/signin?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[var(--color-cyber-neon)] animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-cyber-muted)]">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Unauthorized role
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-cyber-red" />
        </div>
        <h2 className="text-3xl font-heading font-black text-white mb-4 uppercase tracking-tighter">Access Denied</h2>
        <p className="text-[var(--color-cyber-light)] max-w-md mx-auto mb-8 font-body">
          Your current security clearance ({role.toUpperCase()}) does not permit access to this sector.
        </p>
        <Link href={`/dashboard/${role}`} className="btn-primary py-3 px-8 text-xs font-bold tracking-widest uppercase">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
