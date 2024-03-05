'use client';

import { usePathname } from 'next/navigation';
import { Home, Github, Cloud } from 'lucide-react';
import Link from 'next/link';

interface RootLayoutProps {
  children: React.ReactNode;
}

const tabData = [
  { path: '/dashboard', icon: Home, label: 'Backup' },
  { path: '/dashboard/connect-github', icon: Github, label: 'Connect GitHub' },
  { path: '/dashboard/aws-keys', icon: Cloud, label: 'AWS Keys' },
];

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex">
      <div
        className="sidebar bg-base-200 w-64 overflow-y-auto fixed"
        style={{ height: '100vh' }}
      >
        <ul className="menu p-4">
          {tabData.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link
                href={path}
                className={`btn btn-ghost normal-case flex items-center w-full pl-4 justify-start mb-2 ${
                  pathname === path ? 'btn-active' : ''
                }`}
              >
                <Icon className="text-lg" />
                <span className="ml-4">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <main className="flex-grow container mx-auto px-4 pt-6 ml-64">
        <div className="overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
