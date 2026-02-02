'use client'
import React from 'react';

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="border px-2 py-1 rounded" {...props} />;
}
