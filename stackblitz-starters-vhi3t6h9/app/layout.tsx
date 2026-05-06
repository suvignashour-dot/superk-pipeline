import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SuperK Pipeline',
  description: 'Store evaluation and franchise partner review dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
