'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { BookOpen, Loader2, Download, Share2 } from 'lucide-react';
import { BookExportButton } from '@/components/BookExportButton';

interface Chapter {
  title: string;
  content: string;
  order: number;
}

interface SharedBook {
  id: string;
  title: string;
  description?: string;
  chapters: Chapter[];
  createdAt: string;
}

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [book, setBook] = useState<SharedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedBook = async () => {
      try {
        const response = await fetch(`/api/share?id=${shareId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Libro non trovato');
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedBook();
    }
  }, [shareId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: 'var(--accent)' }} />
            <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>Caricamento libro...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !book) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
          <div className="text-center max-w-md">
            <BookOpen className="mx-auto mb-4" size={64} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Libro non disponibile</h2>
            <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              {error || 'Il libro condiviso non è più disponibile o il link è scaduto.'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              {book.title}
            </h1>
            {book.description && (
              <p className="text-lg mt-4" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                {book.description}
              </p>
            )}
            <div className="mt-6 flex justify-center gap-4">
              <BookExportButton
                title={book.title}
                description={book.description}
                chapters={book.chapters.map((ch, idx) => ({
                  id: `chapter-${idx}`,
                  title: ch.title,
                  content: ch.content,
                  order: ch.order,
                }))}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copiato negli appunti!');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Share2 size={18} />
                Condividi Link
              </button>
            </div>
          </div>

          {/* Capitoli */}
          <div className="space-y-8">
            {book.chapters.sort((a, b) => a.order - b.order).map((chapter, index) => (
              <div
                key={index}
                className="rounded-lg shadow-md border p-6"
                style={{
                  backgroundColor: 'var(--paper)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="mb-4">
                  <p className="text-sm uppercase tracking-wide mb-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                    Capitolo {chapter.order}
                  </p>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
                    {chapter.title}
                  </h2>
                </div>
                {chapter.content ? (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                    style={{
                      color: 'var(--foreground)',
                      lineHeight: '1.8',
                    }}
                  />
                ) : (
                  <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>Capitolo vuoto</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

