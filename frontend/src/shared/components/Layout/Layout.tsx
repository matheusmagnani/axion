import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './Layout.css';

export function Layout() {
  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{
        background: 'var(--color-app-bg)',
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
