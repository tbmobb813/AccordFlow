'use client'
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-layout">{children}</div>;
}
