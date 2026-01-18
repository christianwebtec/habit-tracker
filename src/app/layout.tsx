import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Habit Tracker - Compete & Stay Accountable',
  description: 'Track workouts, avoid alcohol, compete with friends on the leaderboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
