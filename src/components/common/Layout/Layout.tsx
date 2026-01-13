'use client';

import Header from '../Header/Header';
import './Layout.css';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <div className="content">{children}</div>
    </div>
  );
}
