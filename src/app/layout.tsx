import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { OfflineBanner } from '@/components/ui/UIStates';

export const metadata: Metadata = {
  title: 'SIAPASN – Platform Simulasi Tes CPNS & Persiapan ASN',
  description: 'Persiapkan Diri, Raih Mimpi Menjadi ASN. Platform simulasi CAT CPNS & PPPK dengan bank soal standar BKN, materi terstruktur, dan analisis passing grade.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <OfflineBanner />
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}

