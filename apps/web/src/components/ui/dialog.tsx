'use client'
import React from 'react';

export default function Dialog({ children }: { children?: React.ReactNode }) {
  return <div className="dialog">{children}</div>;
}
