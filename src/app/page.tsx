'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useStore } from '@/lib/store';
import { BookOpen, FileText, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Dashboard() {
  const { projects, totalCreditsUsed, creditUsage } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  // Idrata lo store al mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      useStore.persist.rehydrate();
      // Forza un aggiornamento dopo la reidratazione
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(true);
    }
  }, []);

  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const todayUsage = creditUsage.filter(
    (usage) =>
      format(new Date(usage.timestamp), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const todayCost = todayUsage.reduce((sum, usage) => sum + usage.cost, 0);

  if (!isMounted) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
          <div className="text-center">
            <BookOpen className="mx-auto mb-4" size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>Caricamento dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
            Panoramica dei tuoi progetti e statistiche
          </p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="p-6 rounded-lg shadow-md border"
            style={{ 
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                Progetti Totali
              </h3>
              <BookOpen size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{projects.length}</p>
          </div>

          <div 
            className="p-6 rounded-lg shadow-md border"
            style={{ 
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                Crediti Totali
              </h3>
              <DollarSign size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>${totalCreditsUsed.toFixed(4)}</p>
          </div>

          <div 
            className="p-6 rounded-lg shadow-md border"
            style={{ 
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                Oggi
              </h3>
              <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>${todayCost.toFixed(4)}</p>
          </div>

          <div 
            className="p-6 rounded-lg shadow-md border"
            style={{ 
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                Parole Totali
              </h3>
              <FileText size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              {projects.reduce(
                (sum, p) => sum + (p.content.split(' ').length || 0),
                0
              )}
            </p>
          </div>
        </div>

        {/* Progetti Recenti */}
        <div 
          className="rounded-lg shadow-md border p-6"
          style={{ 
            backgroundColor: 'var(--paper)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              Progetti Recenti
            </h2>
            <Link
              href="/projects"
              className="text-sm hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Vedi tutti
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
              <BookOpen className="mx-auto mb-4" size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
              <p>Nessun progetto ancora creato</p>
              <Link
                href="/projects"
                className="mt-4 inline-block hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Vai ai Progetti per crearne uno
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href="/projects"
                  className="block p-4 rounded-lg border transition-all hover:shadow-md"
                  style={{ 
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--paper)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>{project.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        {format(new Date(project.updatedAt), 'dd MMMM yyyy', { locale: it })}
                      </p>
                    </div>
                    <div className="text-sm" style={{ color: 'var(--accent)' }}>
                      {project.content.split(' ').length} parole
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
    </div>
    </Layout>
  );
}
