'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useStore } from '@/lib/store';
import { Plus, BookOpen, FileText, Sparkles, Save, Trash2, Wand2, Loader2 } from 'lucide-react';
import { TextEditor } from '@/components/TextEditor';
import { ClientOnly } from '@/components/ClientOnly';
import { ExportButton } from '@/components/ExportButton';
import { BookExportButton } from '@/components/BookExportButton';
import { getAuth } from '@/lib/auth';

// Helper per ottenere la chiave del libro basata sull'utente
function getBookStorageKey(projectId: string): string {
  if (typeof window === 'undefined') return `book-${projectId}`;
  const username = getAuth();
  return username ? `book-${username}-${projectId}` : `book-${projectId}`;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Book {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export default function BookPage() {
  const router = useRouter();
  const { currentProject } = useStore();
  const [book, setBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showNewChapterForm, setShowNewChapterForm] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isAnalyzingLayout, setIsAnalyzingLayout] = useState(false);
  const [layoutAnalysis, setLayoutAnalysis] = useState<string | null>(null);
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      useStore.persist.rehydrate();
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (!currentProject) {
      setBook(null);
      return;
    }

    try {
      const bookKey = getBookStorageKey(currentProject.id);
      const savedBook = localStorage.getItem(bookKey);
      if (savedBook) {
        const parsedBook = JSON.parse(savedBook);
        setBook(parsedBook);
        if (parsedBook.chapters?.length > 0) {
          setSelectedChapter(parsedBook.chapters[0]);
        }
      } else {
        const newBook: Book = {
          id: currentProject.id,
          title: currentProject.title,
          description: '',
          chapters: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBook(newBook);
      }
    } catch (error) {
      console.error('Errore:', error);
      if (currentProject) {
        const newBook: Book = {
          id: currentProject.id,
          title: currentProject.title,
          description: '',
          chapters: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBook(newBook);
      }
    }
  }, [currentProject, isMounted]);

  const fullBookContent = useMemo(() => {
    if (!book || book.chapters.length === 0) return '';
    return book.chapters
      .sort((a, b) => a.order - b.order)
      .map((chapter) => `# ${chapter.title}\n\n${chapter.content}`)
      .join('\n\n');
  }, [book]);

  const saveBook = () => {
    if (!isMounted || !book) return;
    try {
      const updatedBook = { ...book, updatedAt: new Date().toISOString() };
      const bookKey = getBookStorageKey(book.id);
      localStorage.setItem(bookKey, JSON.stringify(updatedBook));
      setBook(updatedBook);
      alert('Libro salvato!');
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nel salvataggio');
    }
  };

  const addChapter = () => {
    if (!book || !newChapterTitle.trim()) return;
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: newChapterTitle,
      content: '',
      order: book.chapters.length,
    };
    const updatedBook = {
      ...book,
      chapters: [...book.chapters, newChapter],
      updatedAt: new Date().toISOString(),
    };
    setBook(updatedBook);
    setSelectedChapter(newChapter);
    setNewChapterTitle('');
    setShowNewChapterForm(false);
    saveBook();
  };

  const deleteChapter = (chapterId: string) => {
    if (!book || !confirm('Eliminare questo capitolo?')) return;
    const updatedChapters = book.chapters
      .filter((ch) => ch.id !== chapterId)
      .map((ch, index) => ({ ...ch, order: index }));
    const updatedBook = {
      ...book,
      chapters: updatedChapters,
      updatedAt: new Date().toISOString(),
    };
    setBook(updatedBook);
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(updatedChapters[0] || null);
    }
    saveBook();
  };

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    if (!book) return;
    const updatedChapters = book.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, ...updates } : ch
    );
    const updatedBook = { ...book, chapters: updatedChapters, updatedAt: new Date().toISOString() };
    setBook(updatedBook);
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(updatedChapters.find((ch) => ch.id === chapterId) || null);
    }
  };

  const generateContent = async () => {
    if (!prompt.trim() || !selectedChapter) {
      setError('Inserisci un prompt');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      // Recupera il contesto dalla memoria
      let fullContext = selectedChapter.content || '';
      if (book?.id) {
        const { memoryManager } = await import('@/lib/memory');
        const memoryContext = memoryManager.getContext(book.id);
        if (memoryContext) {
          fullContext = memoryContext + (selectedChapter.content ? `\n\n${selectedChapter.content}` : '');
        }
      }

      const enhancedPrompt = `Capitolo: ${selectedChapter.title}\n\n${prompt}\n\nIMPORTANTE: Assicurati che il testo generato finisca sempre con una frase completa e una punteggiatura appropriata (punto, punto esclamativo, punto interrogativo). Non interrompere mai a metà frase.`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          context: fullContext,
          projectId: book?.id,
        }),
      });
      if (!response.ok) throw new Error('Errore nella generazione');
      const data = await response.json();
      let generatedContent = data.content.trim();
      
      // Verifica e completa il contenuto se necessario
      generatedContent = ensureCompleteContent(generatedContent);
      
      const newContent = selectedChapter.content
        ? `${selectedChapter.content}\n\n${generatedContent}`
        : generatedContent;
      updateChapter(selectedChapter.id, { content: newContent });
      if (data.usage) {
        const { addCreditUsage } = useStore.getState();
        addCreditUsage(data.usage.totalTokens, data.usage.cost);
      }

      // Salva nella memoria AI
      if (book?.id && data.usage) {
        const { memoryManager } = await import('@/lib/memory');
        memoryManager.addConversation(
          book.id,
          prompt,
          data.content,
          data.usage.totalTokens,
          data.usage.cost
        );
      }

      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore');
    } finally {
      setIsGenerating(false);
    }
  };

  // Funzione per assicurarsi che il contenuto finisca correttamente
  const ensureCompleteContent = (content: string): string => {
    if (!content || !content.trim()) return content;
    
    // Rimuovi spazi finali e newline
    let cleaned = content.trim().replace(/\s+$/, '');
    
    // Verifica se finisce con punteggiatura appropriata
    const endsWithPunctuation = /[.!?…]\s*$/.test(cleaned);
    
    // Se non finisce con punteggiatura, trova l'ultima frase completa
    if (!endsWithPunctuation) {
      // Cerca l'ultima frase completa (terminata da punteggiatura)
      // Cerca pattern più complessi: frase che finisce con punto, punto esclamativo, punto interrogativo
      const lastSentenceMatch = cleaned.match(/.+[.!?…]\s*$/);
      
      if (lastSentenceMatch) {
        // Usa tutto fino all'ultima frase completa
        cleaned = lastSentenceMatch[0].trim();
      } else {
        // Se non c'è nessuna frase completa, cerca l'ultima frase che sembra completa
        // (almeno 10 caratteri, non finisce con virgola, punto e virgola, due punti)
        const sentences = cleaned.split(/([.!?…]\s+)/);
        if (sentences.length > 1) {
          // Prendi tutte le frasi complete tranne l'ultima se sembra incompleta
          let completeText = '';
          for (let i = 0; i < sentences.length - 1; i++) {
            completeText += sentences[i];
          }
          if (completeText.trim().length > 0) {
            cleaned = completeText.trim();
          } else {
            // Se non ci sono frasi complete, aggiungi un punto
            cleaned = cleaned + '.';
          }
        } else {
          // Se non c'è nessuna frase completa, aggiungi un punto
          cleaned = cleaned + '.';
        }
      }
    }
    
    // Verifica che non finisca con frasi incomplete comuni
    const incompletePatterns = [
      /,\s*$/,      // Virgola
      /;\s*$/,      // Punto e virgola
      /:\s*$/,      // Due punti
      /-\s*$/,      // Trattino
      /…\s*$/,      // Ellissi
      /\s+$/,       // Spazi multipli
    ];
    
    for (const pattern of incompletePatterns) {
      if (pattern.test(cleaned)) {
        // Rimuovi la punteggiatura incompleta e aggiungi un punto
        cleaned = cleaned.replace(pattern, '').trim() + '.';
        break;
      }
    }
    
    // Verifica che l'ultima frase non sia troppo corta (probabilmente incompleta)
    const lastSentence = cleaned.split(/[.!?…]\s+/).pop() || '';
    if (lastSentence.trim().length < 10 && !endsWithPunctuation) {
      // Se l'ultima frase è molto corta, potrebbe essere incompleta
      // Rimuovila e usa la frase precedente
      const sentences = cleaned.split(/([.!?…]\s+)/);
      if (sentences.length > 2) {
        cleaned = sentences.slice(0, -2).join('').trim();
        if (!/[.!?…]\s*$/.test(cleaned)) {
          cleaned += '.';
        }
      }
    }
    
    return cleaned.trim();
  };

  // Funzione per correggere tutti i capitoli incompleti
  const fixIncompleteChapters = async () => {
    if (!book || !confirm('Vuoi correggere automaticamente tutti i capitoli che finiscono senza punteggiatura o con frasi incomplete?')) {
      return;
    }

    let fixedCount = 0;
    const updatedChapters = book.chapters.map((chapter) => {
      if (!chapter.content || !chapter.content.trim()) {
        return chapter;
      }

      const fixedContent = ensureCompleteContent(chapter.content);
      if (fixedContent !== chapter.content) {
        fixedCount++;
        return { ...chapter, content: fixedContent };
      }
      return chapter;
    });

    if (fixedCount > 0) {
      const updatedBook = { ...book, chapters: updatedChapters, updatedAt: new Date().toISOString() };
      setBook(updatedBook);
      saveBook();
      alert(`${fixedCount} capitolo/i corretto/i con successo!`);
    } else {
      alert('Tutti i capitoli sono già completi.');
    }
  };

  const analyzeLayout = async () => {
    if (!fullBookContent) {
      setLayoutError('Non ci sono capitoli sufficienti da analizzare.');
      return;
    }

    setLayoutError(null);
    setIsAnalyzingLayout(true);
    setLayoutAnalysis(null);

    try {
      const sampleContent =
        fullBookContent.length > 12000
          ? fullBookContent.slice(0, 12000)
          : fullBookContent;

      const analysisPrompt = `Analizza il seguente libro e proponi una formattazione professionale per impaginazione, font e dimensioni testo.
Fornisci le risposte in italiano con questa struttura:
1. Font consigliati per titoli, sottotitoli, corpo testo
2. Dimensioni e interlinea suggerite (ebook e stampa)
3. Margini e allineamenti consigliati
4. Suggerimenti per la struttura dei capitoli e break di pagina
5. Indicazioni per versione ebook (EPUB/MOBI) e versione stampa (PDF)
6. Eventuali elementi grafici o timeline

Contenuto del libro (estratto):
${sampleContent}`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: analysisPrompt,
          context: sampleContent,
          projectId: currentProject?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Errore durante l’analisi del layout');
      }

      const data = await response.json();
      setLayoutAnalysis(data.content.trim());
    } catch (err: any) {
      console.error('Errore analisi layout:', err);
      setLayoutError(err.message || 'Errore durante l’analisi del layout');
    } finally {
      setIsAnalyzingLayout(false);
    }
  };

  if (!isMounted) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 text-zinc-400 animate-pulse" size={48} />
            <p className="text-zinc-500">Caricamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentProject) {
    return (
      <Layout>
        <div className="p-8" style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
          <div className="max-w-2xl mx-auto text-center py-20">
            <BookOpen className="mx-auto mb-4" size={64} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Nessun progetto selezionato</h2>
            <p style={{ color: 'var(--foreground)', opacity: 0.7, marginBottom: '2rem' }}>
              Crea un nuovo progetto per iniziare a scrivere il tuo libro
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/book/create')}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors shadow-md"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Sparkles size={20} />
                Crea Libro con AI
              </button>
              <button
                onClick={() => router.push('/projects')}
                className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors border"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--accent)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <FileText size={20} />
                Vai ai Progetti
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
        <div 
          className="w-80 border-r flex flex-col shadow-lg"
          style={{ 
            backgroundColor: 'var(--paper)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            {/* Breadcrumb e navigazione */}
            <div className="mb-4">
              <button
                onClick={() => router.push('/projects')}
                className="text-xs mb-2 flex items-center gap-1 transition-colors"
                style={{ color: 'var(--accent)', opacity: 0.8 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
              >
                ← Torna ai Progetti
              </button>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {currentProject?.title || 'Libro'}
              </h3>
            </div>
            
            {book && book.chapters.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                <BookExportButton
                  title={book.title || currentProject?.title || 'Libro'}
                  description={book.description}
                  chapters={book.chapters}
                />
                <button
                  onClick={fixIncompleteChapters}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  style={{
                    backgroundColor: 'rgba(139, 111, 71, 0.15)',
                    color: 'var(--accent)',
                  }}
                  title="Corregge automaticamente i capitoli che finiscono senza punteggiatura o con frasi incomplete"
                >
                  <Save size={16} />
                  Correggi Capitoli
                </button>
                <button
                  onClick={analyzeLayout}
                  disabled={isAnalyzingLayout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(139, 111, 71, 0.15)',
                    color: 'var(--accent)',
                  }}
                >
                  {isAnalyzingLayout ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analisi in corso...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      Analizza Layout AI
                    </>
                  )}
                </button>
              </div>
            )}
            <div className="mb-4">
              <button
                onClick={() => router.push('/book/create')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-md mb-3"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                <Sparkles size={16} />
                <span className="text-sm font-semibold">Crea Libro con AI</span>
              </button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>Capitoli</h2>
              <button
                onClick={() => mode === 'edit' && setShowNewChapterForm(!showNewChapterForm)}
                disabled={mode === 'view'}
                className="p-2 rounded transition-colors disabled:opacity-50"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus size={18} />
              </button>
            </div>
            {showNewChapterForm && mode === 'edit' && (
              <div className="mb-3">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChapter()}
                  placeholder="Titolo capitolo..."
                  className="w-full px-3 py-2 border rounded-lg text-sm transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)'
                  }}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={addChapter} 
                    className="flex-1 px-3 py-1.5 text-white text-sm rounded shadow-sm"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Aggiungi
                  </button>
                  <button
                    onClick={() => { setShowNewChapterForm(false); setNewChapterTitle(''); }}
                    className="flex-1 px-3 py-1.5 text-sm rounded border"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)'
                    }}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
            <div className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{book?.chapters.length || 0} capitoli</div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {!book || book.chapters.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                <FileText className="mx-auto mb-3" size={32} style={{ color: 'var(--accent)', opacity: 0.5 }} />
                <p>Nessun capitolo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {book.chapters.sort((a, b) => a.order - b.order).map((chapter) => (
                  <div
                    key={chapter.id}
                    className="p-3 rounded border cursor-pointer text-sm transition-all shadow-sm"
                    style={{
                      borderColor: selectedChapter?.id === chapter.id ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: selectedChapter?.id === chapter.id ? 'rgba(139, 111, 71, 0.1)' : 'var(--background)',
                    }}
                    onClick={() => setSelectedChapter(chapter)}
                    onMouseEnter={(e) => {
                      if (selectedChapter?.id !== chapter.id) {
                        e.currentTarget.style.backgroundColor = 'var(--paper)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChapter?.id !== chapter.id) {
                        e.currentTarget.style.backgroundColor = 'var(--background)';
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{chapter.title}</h3>
                        <p className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                          {chapter.content.split(/\s+/).filter(Boolean).length} parole
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
                        className="p-1 text-red-600 rounded transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={saveBook}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg text-sm shadow-md"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <Save size={16} />
              Salva
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
          {(layoutAnalysis || layoutError) && (
            <div
              className="p-4 border-b"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--paper)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>
                  Suggerimenti Layout AI
                </h3>
                <button
                  onClick={() => {
                    setLayoutAnalysis(null);
                    setLayoutError(null);
                  }}
                  className="text-sm px-3 py-1 border rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--accent)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Chiudi
                </button>
              </div>
              {layoutError && (
                <p className="text-sm mb-3" style={{ color: '#dc2626' }}>
                  {layoutError}
                </p>
              )}
              {layoutAnalysis && (
                <div
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  style={{ color: 'var(--foreground)', opacity: 0.9 }}
                >
                  {layoutAnalysis}
                </div>
              )}
            </div>
          )}
          <div
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 border-b"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--paper)' }}
          >
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                Modalità
              </p>
              <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                Visualizza il libro o entra in modifica
              </p>
            </div>
            <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setMode('view')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'view' ? 'bg-[var(--accent)] text-white' : 'text-[var(--accent)]'}`}
              >
                Visualizza
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'edit' ? 'bg-[var(--accent)] text-white' : 'text-[var(--accent)]'}`}
              >
                Modifica
              </button>
            </div>
          </div>
          {selectedChapter ? (
            mode === 'edit' ? (
              <>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--paper)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={selectedChapter.title}
                        onChange={(e) => updateChapter(selectedChapter.id, { title: e.target.value })}
                        className="text-xl font-bold bg-transparent border-none outline-none w-full"
                        style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}
                        placeholder="Titolo..."
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        Capitolo {book?.chapters.findIndex((ch) => ch.id === selectedChapter.id)! + 1} di {book?.chapters.length}
                      </p>
                    </div>
                    <ExportButton title={selectedChapter.title} content={selectedChapter.content} />
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && generateContent()}
                        placeholder="Prompt per generare contenuto..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm transition-colors"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--paper)',
                          color: 'var(--foreground)'
                        }}
                        disabled={isGenerating}
                      />
                      <button
                        onClick={generateContent}
                        disabled={isGenerating || !prompt.trim()}
                        className="px-4 py-2 text-white rounded-lg disabled:opacity-50 text-sm shadow-md"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        {isGenerating ? '...' : <Sparkles size={16} />}
                      </button>
                    </div>
                    {error && <div className="mt-2 text-red-600 text-xs">{error}</div>}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <ClientOnly>
                    <TextEditor
                      content={selectedChapter.content}
                      onChange={(content) => updateChapter(selectedChapter.id, { content })}
                      placeholder="Scrivi il capitolo..."
                    />
                  </ClientOnly>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wide" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                      Capitolo {book?.chapters.findIndex((ch) => ch.id === selectedChapter.id)! + 1}
                    </p>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
                      {selectedChapter.title}
                    </h2>
                  </div>
                  <ExportButton title={selectedChapter.title} content={selectedChapter.content} />
                </div>
                {selectedChapter.content ? (
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
                  />
                ) : (
                  <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Il capitolo è vuoto. Passa in modalità modifica per iniziare a scrivere.
                  </p>
                )}
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="mx-auto mb-4" size={48} style={{ color: 'var(--accent)', opacity: 0.5 }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Seleziona un capitolo</h3>
                {book && book.chapters.length === 0 && mode === 'edit' && (
                  <button
                    onClick={() => setShowNewChapterForm(true)}
                    className="px-4 py-2 text-white rounded-lg shadow-md"
                    style={{ backgroundColor: 'var(--accent)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    Crea Primo Capitolo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
