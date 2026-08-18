"use client";

import React from 'react';
import { UserRole } from '@/core/context/AuthContext';
import { Shield, Zap, User } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const config = {
    member: {
      color: 'text-cyber-green border-cyber-green bg-cyber-green/10',
      icon: User,
      label: 'MEMBER'
    },
    admin: {
      color: 'text-cyber-blue border-cyber-blue bg-cyber-blue/10',
      icon: Zap,
      label: 'ADMIN'
    },
    superadmin: {
      color: 'text-cyber-red border-cyber-red bg-cyber-red/10',
      icon: Shield,
      label: 'SUPER ADMIN'
    }
  };

  const { color, icon: Icon, label } = config[role] || config.member;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-mono font-bold tracking-widest rounded-sm uppercase ${color} ${className}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}
