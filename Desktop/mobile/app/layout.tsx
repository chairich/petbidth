import './globals.css'
import { Inter } from 'next/font/google'
import { ReactNode, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PetBidThai',
  description: 'เว็บประมูลสัตว์เลี้ยงออนไลน์',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          registration => {
            console.log('ServiceWorker registration successful:', registration.scope);
          },
          err => {
            console.log('ServiceWorker registration failed:', err);
          }
        );
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo192x192.png" />
        <meta name="theme-color" content="#FFD700" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}