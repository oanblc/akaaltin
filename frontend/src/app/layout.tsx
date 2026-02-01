import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aka Kuyumculuk - Güncel Altın Fiyatları',
  description: 'Adana\'da güvenilir kuyumcu. Güncel altın ve gümüş fiyatları.',
  keywords: 'altın fiyatları, kuyumcu, adana kuyumcu, altın alış, altın satış',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <SettingsProvider>
          {children}
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
