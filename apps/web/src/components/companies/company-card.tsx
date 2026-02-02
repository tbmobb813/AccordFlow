'use client'
import React from 'react';

export default function CompanyCard({ name }: { name: string }) {
  return <div className="card">{name}</div>;
}
