import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Gamvio Game',
  description: 'A game built with Gamvio Game SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a12', color: '#e4e4e7' }}>
        {children}
      </body>
    </html>
  );
}
