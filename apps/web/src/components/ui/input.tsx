'use client'
import React from 'react';

type Props = React.ComponentPropsWithoutRef<'input'>;

export default function Input(props: Props) {
  return <input className="border px-2 py-1 rounded" {...props} />;
}
