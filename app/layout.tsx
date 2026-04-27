import type { Metadata } from 'next';
import './globals.css';
import { WalletProvider } from '@/components/WalletContext';

export const metadata: Metadata = {
  title: 'PayFlow — Cross-Chain Payments',
  description: 'Send, Swap, and Bridge USDC on Arc Testnet and beyond. Powered by Circle.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
