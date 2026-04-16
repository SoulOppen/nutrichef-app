'use client';

import dynamic from 'next/dynamic';

const NextAppShell = dynamic(() => import('./NextAppShell.jsx'), {
  ssr: false,
});

export default function ClientOnlyShell() {
  return <NextAppShell />;
}
