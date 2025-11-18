'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { BookOpen, Loader2, Download, Share2, LogIn, Lock, User } from 'lucide-react';
import { BookExportButton } from '@/components/BookExportButton';
import { isAuthenticated, verifyCredentials, setAuth } from '@/lib/auth';

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
  const router = useRouter();
  const shareId = params.shareId as string;
  const [book, setBook] = useState<SharedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Verifica autenticazione
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      setIsCheckingAuth(false);
      
      // Se autenticato, carica il libro
      if (auth && shareId) {
        fetchSharedBook();
      }
    }
  }, [shareId]);

  const fetchSharedBook = async () => {
    try {
      setLoading(true);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError('Inserisci username e password');
      setIsLoggingIn(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (verifyCredentials(loginUsername.trim(), loginPassword)) {
      setAuth(loginUsername.trim());
      setAuthenticated(true);
      setIsLoggingIn(false);
      // Carica il libro dopo il login
      fetchSharedBook();
    } else {
      setLoginError('Username o password non corretti');
      setIsLoggingIn(false);
    }
  };

  // Mostra login se non autenticato
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
        <div 
          className="w-full max-w-md rounded-lg shadow-xl border p-8"
          style={{ 
            backgroundColor: 'var(--paper)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="text-6xl">🦙</div>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              Lama Bollente
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Accedi per visualizzare il contenuto condiviso
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} style={{ color: 'var(--foreground)', opacity: 0.5 }} />
                </div>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="Inserisci username"
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(139, 111, 71, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  autoComplete="username"
                  disabled={isLoggingIn}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} style={{ color: 'var(--foreground)', opacity: 0.5 }} />
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  placeholder="Inserisci password"
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.boxShadow = '0 0 0 2px rgba(139, 111, 71, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  autoComplete="current-password"
                  disabled={isLoggingIn}
                />
              </div>
            </div>

            {loginError && (
              <div 
                className="p-3 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'rgba(220, 38, 38, 0.1)', 
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#dc2626'
                }}
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => {
                if (!isLoggingIn) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Accesso in corso...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Accedi</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
              Account disponibili: alpha, beta, gamma
            </p>
          </div>
        </div>
      </div>
    );
  }

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

