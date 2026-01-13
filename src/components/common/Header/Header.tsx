'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Header.css';

export default function Header() {
  const pathname = usePathname();

  return (
    <div className="nav-header">
      <div className="version-box">
        <div className="test-app">
          Demo <span className="version">v1.0</span>
        </div>
        <div className="mobiscroll">
          Mobiscroll Connect <span className="version">v1.0</span>
        </div>
      </div>

      <h2>Mobiscroll Connect Demo</h2>

      <nav className="nav-menu">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link href="/calendars" className={pathname === '/calendars' ? 'active' : ''}>
          Calendars
        </Link>
        <Link href="/events" className={pathname === '/events' ? 'active' : ''}>
          Events
        </Link>
        <Link href="/event-edit" className={pathname === '/event-edit' ? 'active' : ''}>
          Event Edit
        </Link>
      </nav>
    </div>
  );
}
