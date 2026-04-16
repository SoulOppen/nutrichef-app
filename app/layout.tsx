import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'NutriChef IA',
  description: 'Asistente de cocina inteligente',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
