'use client';

import "../styles/index.scss";
import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head> <link rel="icon" href="/favicon.png" sizes="any" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="PetBidThai" />
            <meta name="mobile-web-app-capable" content="yes" />
            <link rel="icon" href="favicon.png" sizes="any" />
            <link rel="icon" type="image/png" href="/favicon.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <meta name="theme-color" content="#1e1e2d" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="PetBidThai" />
            <meta name="mobile-web-app-capable" content="yes" />
   
            <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
        /> 
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
