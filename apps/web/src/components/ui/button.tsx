'use client'
import React from 'react';

export default function Button({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1 rounded bg-blue-600 text-white">
      {children}
    </button>
  );
}
