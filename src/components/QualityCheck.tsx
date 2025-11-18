'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

interface QualityMetrics {
  coherence: number;
  syntax: number;
  readability: number;
  suggestions: string[];
}

interface QualityCheckProps {
  content: string;
}

export function QualityCheck({ content }: QualityCheckProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeContent = async () => {
    if (!content.trim()) {
      setError('Inserisci del contenuto da analizzare');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'analisi');
      }

      const data = await response.json();
      setMetrics(data);

      // Traccia l'utilizzo dei crediti
      if (data.usage) {
        const { addCreditUsage } = useStore.getState();
        addCreditUsage(data.usage.totalTokens, data.usage.cost);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div 
      className="p-6 rounded-lg border shadow-md"
      style={{ 
        backgroundColor: 'var(--paper)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>Controllo Qualità</h3>
        <button
          onClick={analyzeContent}
          disabled={isAnalyzing || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseEnter={(e) => {
            if (!isAnalyzing && content.trim()) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analizzando...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Analizza
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {metrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${getScoreBg(metrics.coherence)}`}>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Coerenza
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.coherence)}`}>
                {metrics.coherence}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${getScoreBg(metrics.syntax)}`}>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Sintassi
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.syntax)}`}>
                {metrics.syntax}%
              </div>
            </div>
            <div className={`p-4 rounded-lg ${getScoreBg(metrics.readability)}`}>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Leggibilità
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.readability)}`}>
                {metrics.readability}%
              </div>
            </div>
          </div>

          {metrics.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-600" />
                Suggerimenti
              </h4>
              <ul className="space-y-2">
                {metrics.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2"
                  >
                    <CheckCircle size={16} className="mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metrics.suggestions.length === 0 && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle size={20} />
              <span className="font-medium">Il testo è di ottima qualità!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

