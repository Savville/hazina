import { ReactNode } from 'react';
import Link from 'next/link';
import '@/app/globals.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="hz-admin-layout">
      {/* Sidebar */}
      <aside className="hz-admin-sidebar">
        <div className="hz-admin-logo">
          Hazina <span>HQ</span>
        </div>
        <nav className="hz-admin-nav">
          <Link href="/admin" className="hz-admin-nav-item active">
            Pending Approvals
          </Link>
          <Link href="/admin/published" className="hz-admin-nav-item">
            Published Parcels
          </Link>
          <Link href="/admin/scouts" className="hz-admin-nav-item">
            Manage Scouts
          </Link>
          <Link href="/admin/legal" className="hz-admin-nav-item">
            ELC Crosscheck (Beta)
          </Link>
        </nav>
        <div className="hz-admin-user">
          <div className="avatar">A</div>
          <div>
            <p>Admin User</p>
            <span>Operations Lead</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="hz-admin-main">
        {children}
      </main>
    </div>
  );
}
