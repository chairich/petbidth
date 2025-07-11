import ServiceWorkerRegister from "./_components/ServiceWorkerRegister";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
