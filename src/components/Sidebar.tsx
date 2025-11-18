'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, FileText, Sparkles, DollarSign, BookMarked, PenTool } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Logo } from '@/components/Logo';

export function Sidebar() {
  const pathname = usePathname();
  const { projects, totalCreditsUsed, currentProject } = useStore();

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/book', icon: BookMarked, label: 'Scrivi Libro' },
    { href: '/article/create', icon: PenTool, label: 'Crea Articolo' },
    { href: '/prompts', icon: Sparkles, label: 'Prompt Guidati' },
    { href: '/projects', icon: BookOpen, label: 'Progetti' },
  ];

  return (
    <aside 
      className="w-64 min-h-screen p-6 flex flex-col shadow-lg"
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
        <div className="flex items-center gap-2 text-sm" style={{ color: '#d4c4a8' }}>
          <DollarSign size={16} />
          <span>
            Crediti: <span className="font-semibold" style={{ color: '#fff' }}>${totalCreditsUsed.toFixed(4)}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
