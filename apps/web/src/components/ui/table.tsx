'use client'
import React from 'react';

export default function Table({ children }: { children?: React.ReactNode }) {
  return <table className="min-w-full">{children}</table>;
}
