'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useStore } from '@/lib/store';
import { BookOpen, Sparkles, ArrowRight, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { memoryManager } from '@/lib/memory';

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

type Step = 'input' | 'generating' | 'complete';

export default function CreateBookPage() {
  const router = useRouter();
  const { currentProject, createProject, updateProject } = useStore();
  const [step, setStep] = useState<Step>('input');
  const [isMounted, setIsMounted] = useState(false);
  
  // Input step
  const [bookPrompt, setBookPrompt] = useState('');
  const [minPages, setMinPages] = useState(50);
  const [bookTitle, setBookTitle] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  
  // Generating step
  const [generatedBook, setGeneratedBook] = useState<Book | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      useStore.persist.rehydrate();
      // Forza un re-render dopo la reidratazione
      setTimeout(() => {
        setIsMounted(true);
      }, 100);
    }
  }, []);

  // Calcola il numero di capitoli in base alle pagine
  const calculateChapters = (pages: number) => {
    // Assumiamo circa 250 parole per pagina e 2000 parole per capitolo
    const wordsPerPage = 250;
    const wordsPerChapter = 2000;
    const totalWords = pages * wordsPerPage;
    const chapters = Math.max(3, Math.ceil(totalWords / wordsPerChapter));
    return chapters;
  };

  const generateBookStructure = async (prompt: string, chapters: number) => {
    try {
      const structurePrompt = `Crea la struttura di un libro basato su questo tema: "${prompt}"

Il libro deve avere ${chapters} capitoli. 
Rispondi SOLO con un JSON valido in questo formato:
{
  "title": "Titolo del libro",
  "description": "Breve descrizione del libro",
  "chapters": [
    {"title": "Titolo Capitolo 1", "summary": "Breve riassunto"},
    {"title": "Titolo Capitolo 2", "summary": "Breve riassunto"},
    ...
  ]
}

Non includere altro testo, solo il JSON.`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: structurePrompt,
          context: '',
          projectId: currentProject?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione');
      }

      const data = await response.json();
      const generatedText = data.content.trim();

      // Estrai JSON dalla risposta
      let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato risposta non valido');
      }

      const structure = JSON.parse(jsonMatch[0]);
      
      return {
        title: structure.title || bookTitle || 'Libro Generato',
        description: structure.description || '',
        chapters: structure.chapters.map((ch: any, index: number) => ({
          id: `chapter-${index + 1}`,
          title: ch.title || `Capitolo ${index + 1}`,
          summary: ch.summary || '',
          order: index + 1,
          content: '', // Inizialmente vuoto
        })),
      };
    } catch (error: any) {
      console.error('Errore nella generazione della struttura:', error);
      throw error;
    }
  };

  const generateChapterContent = async (
    chapterTitle: string,
    chapterSummary: string,
    bookContext: string,
    previousChapters: Chapter[]
  ) => {
    const previousContent = previousChapters
      .map((ch, idx) => `Capitolo ${idx + 1}: ${ch.title}\n${ch.content.substring(0, 500)}...`)
      .join('\n\n');

    const chapterPrompt = `Scrivi il capitolo completo "${chapterTitle}" per un libro.

${bookContext ? `Contesto del libro:\n${bookContext}\n\n` : ''}
${chapterSummary ? `Riassunto del capitolo:\n${chapterSummary}\n\n` : ''}
${previousContent ? `Capitoli precedenti (per coerenza):\n${previousContent}\n\n` : ''}

REGOLE IMPORTANTI:
- Scrivi un capitolo completo, dettagliato e coinvolgente di almeno 1500-2000 parole
- Il capitolo deve essere ben strutturato, con paragrafi chiari e uno stile narrativo fluido
- CRITICO: Il capitolo DEVE finire sempre con una frase completa e una punteggiatura appropriata (punto, punto esclamativo, o punto interrogativo)
- NON interrompere mai a metà frase o a metà pensiero
- Assicurati che l'ultima frase sia grammaticalmente corretta e completa
- Concludi il capitolo in modo naturale e soddisfacente per il lettore`;

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: chapterPrompt,
        context: previousContent,
        projectId: currentProject?.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Errore nella generazione del capitolo');
    }

    const data = await response.json();
    let content = data.content.trim();
    
    // Verifica e completa il contenuto se necessario
    content = ensureCompleteContent(content);
    
    return content;
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
      const lastSentenceMatch = cleaned.match(/.+[.!?…]\s*$/);
      
      if (lastSentenceMatch) {
        // Usa tutto fino all'ultima frase completa
        cleaned = lastSentenceMatch[0].trim();
      } else {
        // Se non c'è nessuna frase completa, cerca l'ultima frase che sembra completa
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

  const handleStartGeneration = async () => {
    if (!bookPrompt.trim()) {
      setError('Inserisci un tema o una descrizione per il libro');
      return;
    }

    setError(null);
    setStep('generating');
    setIsGenerating(true);

    try {
      // Crea o usa il progetto corrente
      let project = currentProject;
      if (!project) {
        const projectTitle = bookTitle || `Libro - ${new Date().toLocaleDateString()}`;
        createProject(projectTitle);
        // Aspetta che il progetto venga creato
        await new Promise(resolve => setTimeout(resolve, 100));
        project = useStore.getState().currentProject;
      }

      if (!project) {
        throw new Error('Impossibile creare il progetto. Assicurati di avere un progetto selezionato.');
      }

      // Crea memoria se non esiste
      if (typeof window !== 'undefined') {
        if (!memoryManager.getMemory(project.id)) {
          memoryManager.createMemory(project.id, project);
        }
      }

      // Calcola numero di capitoli
      const numChapters = calculateChapters(minPages);
      setProgress(5);

      // Genera struttura del libro
      const structure = await generateBookStructure(bookPrompt, numChapters);
      setProgress(15);

      setBookTitle(structure.title);
      setBookDescription(structure.description);

      // Crea il libro con i capitoli vuoti
      const newBook: Book = {
        id: project.id,
        title: structure.title,
        description: structure.description,
        chapters: structure.chapters.map((ch: any) => ({
          id: ch.id,
          title: ch.title,
          content: '',
          order: ch.order,
        })) as Chapter[],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGeneratedBook(newBook);
      setProgress(20);

      // Genera contenuto per ogni capitolo
      const bookContext = `${structure.description}\n\nTema: ${bookPrompt}`;
      const generatedChapters: Chapter[] = [];

      for (let i = 0; i < newBook.chapters.length; i++) {
        setCurrentChapterIndex(i);
        const chapter = newBook.chapters[i];
        
        // Trova il summary dal capitolo originale nella struttura
        const originalChapter = structure.chapters.find((ch: any) => ch.id === chapter.id);
        const content = await generateChapterContent(
          chapter.title,
          originalChapter?.summary || '',
          bookContext,
          generatedChapters
        );

        generatedChapters.push({
          ...chapter,
          content,
        });

        // Aggiorna il libro con il nuovo capitolo
        setGeneratedBook({
          ...newBook,
          chapters: [
            ...generatedChapters,
            ...newBook.chapters.slice(i + 1),
          ],
        });

        // Aggiorna progresso
        const baseProgress = 20;
        const progressPerChapter = 70 / newBook.chapters.length;
        setProgress(baseProgress + (i + 1) * progressPerChapter);
      }

      // Salva il libro completato
      localStorage.setItem(`book-${project.id}`, JSON.stringify({
        ...newBook,
        chapters: generatedChapters,
        updatedAt: new Date().toISOString(),
      }));

      // Aggiorna il progetto con il contenuto completo
      const fullContent = generatedChapters
        .map((ch) => `# ${ch.title}\n\n${ch.content}`)
        .join('\n\n');
      
      updateProject(project.id, {
        title: structure.title,
        content: fullContent,
      });

      setProgress(100);
      setStep('complete');
    } catch (error: any) {
      console.error('Errore:', error);
      setError(error.message || 'Errore nella generazione del libro');
      setStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isMounted) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)' }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 overflow-y-auto" style={{ backgroundColor: 'var(--background)', minHeight: '100vh', height: '100vh' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/book')}
              className="flex items-center gap-2 mb-4 text-sm transition-colors"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <ArrowLeft size={16} />
              Torna alla gestione libro
            </button>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              Crea un Libro Completo
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Genera automaticamente un libro completo partendo da un'idea
            </p>
          </div>

          {/* Step 1: Input */}
          {step === 'input' && (
            <div 
              className="rounded-lg shadow-md border p-8"
              style={{ 
                backgroundColor: 'var(--paper)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                    Tema o Descrizione del Libro *
                  </label>
                  <textarea
                    value={bookPrompt}
                    onChange={(e) => setBookPrompt(e.target.value)}
                    placeholder="Es: Un romanzo fantasy su un giovane mago che scopre di avere poteri speciali e deve salvare il regno da un'antica minaccia..."
                    className="w-full px-4 py-3 border rounded-lg transition-colors resize-none"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      minHeight: '120px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                      e.target.style.boxShadow = '0 0 0 2px rgba(139, 111, 71, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                    Descrivi il tema, la trama o l'idea principale del libro che vuoi creare
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                    Numero Minimo di Pagine
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="30"
                      max="500"
                      step="10"
                      value={minPages}
                      onChange={(e) => setMinPages(Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <div className="w-24 text-center">
                      <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                        {minPages}
                      </span>
                      <span className="text-sm ml-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        pagine
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                    Circa {calculateChapters(minPages)} capitoli verranno generati
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleStartGeneration}
                  disabled={!bookPrompt.trim()}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent)' }}
                  onMouseEnter={(e) => {
                    if (bookPrompt.trim()) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Sparkles size={20} />
                  <span className="text-lg font-semibold">Genera Libro Completo</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Generating */}
          {step === 'generating' && (
            <div 
              className="rounded-lg shadow-md border p-8"
              style={{ 
                backgroundColor: 'var(--paper)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="text-center space-y-6">
                <Loader2 className="animate-spin mx-auto" size={48} style={{ color: 'var(--accent)' }} />
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
                    Generazione in corso...
                  </h2>
                  <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    {generatedBook && currentChapterIndex < generatedBook.chapters.length
                      ? `Generando: ${generatedBook.chapters[currentChapterIndex]?.title}`
                      : 'Creando la struttura del libro...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: 'var(--accent)',
                    }}
                  />
                </div>
                <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                  {Math.round(progress)}% completato
                </p>

                {generatedBook && (
                  <div className="mt-8 text-left">
                    <h3 className="font-semibold mb-3" style={{ color: 'var(--accent)' }}>
                      Struttura del libro:
                    </h3>
                    <div className="space-y-2">
                      {generatedBook.chapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{
                            backgroundColor: index <= currentChapterIndex ? 'rgba(139, 111, 71, 0.1)' : 'transparent',
                            border: index === currentChapterIndex ? '2px solid var(--accent)' : '1px solid var(--border)',
                          }}
                        >
                          {index < currentChapterIndex ? (
                            <CheckCircle size={20} style={{ color: 'var(--accent)' }} />
                          ) : index === currentChapterIndex ? (
                            <Loader2 className="animate-spin" size={20} style={{ color: 'var(--accent)' }} />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />
                          )}
                          <span style={{ color: 'var(--foreground)' }}>
                            {index + 1}. {chapter.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && generatedBook && (
            <div 
              className="rounded-lg shadow-md border p-8"
              style={{ 
                backgroundColor: 'var(--paper)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="text-center space-y-6">
                <CheckCircle size={64} style={{ color: 'var(--accent)' }} />
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
                    Libro Generato con Successo!
                  </h2>
                  <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Il tuo libro "{generatedBook.title}" è pronto
                  </p>
                </div>

                <div className="text-left space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>Descrizione:</h3>
                    <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>{generatedBook.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                      Capitoli generati: {generatedBook.chapters.length}
                    </h3>
                    <div className="space-y-2">
                      {generatedBook.chapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{ border: '1px solid var(--border)' }}
                        >
                          <CheckCircle size={20} style={{ color: 'var(--accent)' }} />
                          <span style={{ color: 'var(--foreground)' }}>
                            {index + 1}. {chapter.title}
                          </span>
                          <span className="ml-auto text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                            {chapter.content.split(' ').length} parole
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/book')}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors shadow-md"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <BookOpen size={20} />
                    Vai al Libro
                  </button>
                  <button
                    onClick={() => {
                      setStep('input');
                      setBookPrompt('');
                      setGeneratedBook(null);
                      setProgress(0);
                    }}
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
                    Crea un Altro Libro
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

