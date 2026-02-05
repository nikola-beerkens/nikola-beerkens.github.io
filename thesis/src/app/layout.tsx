import type { Metadata } from 'next';
import './globals.css';
import { VT323} from 'next/font/google'

const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
})

export const metadata: Metadata = {
  title: 'BakeML',
  description: 'BakeML game',
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
