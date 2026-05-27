import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Veda AI — AI Assessment Creator',
    template: '%s | Veda AI',
  },
  description:
    'Generate professional, structured exam papers in seconds using AI. Supports MCQ, Short Answer, and Long Answer questions with intelligent difficulty distribution.',
  keywords: ['AI assessment', 'exam paper generator', 'question paper', 'teacher tool'],
  authors: [{ name: 'Veda AI' }],
  openGraph: {
    title: 'Veda AI — AI Assessment Creator',
    description: 'Generate professional exam papers instantly with AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#ebebeb] text-[#2d2d2d] antialiased">
        <div className="relative flex min-h-screen">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Layout Area */}
          <div className="flex-1 pl-80 pr-6 pt-4 pb-6">
            {/* Top Navbar */}
            <Navbar />

            {/* Main Content Pages */}
            <main>{children}</main>
          </div>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#2d2d2d',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#e05a36', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
