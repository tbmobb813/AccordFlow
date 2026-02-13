'use client'
import React from 'react';

export default function ContactCard({ name }: { name: string }) {
  return <div className="card">{name}</div>;
}
