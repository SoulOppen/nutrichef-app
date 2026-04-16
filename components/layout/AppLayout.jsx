'use client';

import TipsWidget from '@/components/TipsWidget.jsx';
import Footer from '@/components/Footer.jsx';
import Navbar from '@/components/Navbar.jsx';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans pb-28 md:pb-12 transition-colors duration-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 sm:px-5 lg:px-4 py-6 md:py-8">
        {children}
      </main>

      <TipsWidget />
      <Footer />
    </div>
  );
}
