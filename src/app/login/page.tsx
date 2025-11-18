'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { verifyCredentials, setAuth } from '@/lib/auth';
import { LogIn, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Se già autenticato, reindirizza
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('lama-bollente-auth');
      if (auth) {
        router.push('/');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Inserisci username e password');
      setIsLoading(false);
      return;
    }

    // Simula un piccolo delay per UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (verifyCredentials(username.trim(), password)) {
      setAuth(username.trim());
      router.push('/');
      router.refresh();
    } else {
      setError('Username o password non corretti');
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

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
            Accedi al tuo studio di scrittura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                disabled={isLoading}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ 
                backgroundColor: 'rgba(220, 38, 38, 0.1)', 
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#dc2626'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {isLoading ? (
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

