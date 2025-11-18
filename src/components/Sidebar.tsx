'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, FileText, Sparkles, DollarSign, BookMarked, PenTool, LogOut, User, Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Logo } from '@/components/Logo';
import { getAuth, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { projects, totalCreditsUsed, currentProject } = useStore();
  const [username, setUsername] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(getAuth());
    }
  }, []);

  // Chiudi il menu quando cambia la route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (confirm('Sei sicuro di voler uscire?')) {
      clearAuth();
      router.push('/login');
      router.refresh();
    }
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/book', icon: BookMarked, label: 'Scrivi Libro' },
    { href: '/article/create', icon: PenTool, label: 'Crea Articolo' },
    { href: '/prompts', icon: Sparkles, label: 'Prompt Guidati' },
    { href: '/projects', icon: BookOpen, label: 'Progetti' },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg"
        style={{ 
          backgroundColor: 'var(--sidebar)',
          color: '#e8e0d4'
        }}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay per mobile */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed md:static
          top-0 left-0
          w-64 min-h-screen p-6 flex flex-col shadow-lg
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ 
          backgroundColor: 'var(--sidebar)',
          color: '#e8e0d4'
        }}
      >
      <div className="mb-8">
        <div className="mb-2">
          <Logo size="md" showText={true} animated={true} textColor="#d4c4a8" />
        </div>
        <p className="text-sm" style={{ color: '#a6895d' }}>
          Il tuo studio di scrittura
        </p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isActive ? 'shadow-md text-white' : 'hover:shadow-sm text-[#d4c4a8]'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

  <div className="mt-auto pt-6 border-t" style={{ borderColor: 'rgba(212, 196, 168, 0.3)' }}>
        {username && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 111, 71, 0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <User size={14} style={{ color: '#a6895d' }} />
              <p className="text-xs" style={{ color: '#a6895d' }}>Utente</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#fff' }}>
              {username}
            </p>
          </div>
        )}
        {currentProject && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 111, 71, 0.2)' }}>
            <p className="text-xs mb-1" style={{ color: '#a6895d' }}>Progetto Corrente</p>
            <p className="text-sm font-semibold truncate" style={{ color: '#fff' }} title={currentProject.title}>
              {currentProject.title}
            </p>
          </div>
        )}
        <div className="text-sm mb-3" style={{ color: '#a6895d' }}>
          <p>Progetti attivi: {projects.length}</p>
        </div>
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: '#d4c4a8' }}>
          <DollarSign size={16} />
          <span>
            Crediti: <span className="font-semibold" style={{ color: '#fff' }}>${totalCreditsUsed.toFixed(4)}</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border"
          style={{
            borderColor: 'rgba(220, 38, 38, 0.5)',
            backgroundColor: 'transparent',
            color: '#dc2626'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={16} />
          <span>Esci</span>
        </button>
      </div>
    </aside>
    </>
  );
}
