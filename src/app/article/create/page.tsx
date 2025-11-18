'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useStore } from '@/lib/store';
import { FileText, Sparkles, ArrowRight, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { memoryManager } from '@/lib/memory';

type Step = 'input' | 'generating' | 'complete';

export default function CreateArticlePage() {
  const router = useRouter();
  const { currentProject, createProject, updateProject } = useStore();
  const [step, setStep] = useState<Step>('input');
  const [isMounted, setIsMounted] = useState(false);
  
  // Input step
  const [articlePrompt, setArticlePrompt] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [wordCount, setWordCount] = useState(1000);
  const [articleType, setArticleType] = useState<'article' | 'essay' | 'blog' | 'story'>('article');
  
  // Generating step
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      useStore.persist.rehydrate();
      setTimeout(() => {
        setIsMounted(true);
      }, 100);
    }
  }, []);

  // Funzione per verificare se il contenuto termina correttamente
  const isContentComplete = (content: string): boolean => {
    if (!content || !content.trim()) return false;
    
    const trimmed = content.trim();
    
    // Deve finire con punteggiatura appropriata
    const endsWithPunctuation = /[.!?…]\s*$/.test(trimmed);
    if (!endsWithPunctuation) return false;
    
    // Non deve finire con punteggiatura incompleta
    const incompletePatterns = [
      /,\s*$/,
      /;\s*$/,
      /:\s*$/,
      /-\s*$/,
      /…\s*$/,
    ];
    
    for (const pattern of incompletePatterns) {
      if (pattern.test(trimmed)) return false;
    }
    
    // L'ultima frase deve essere completa (almeno 10 caratteri)
    const lastSentence = trimmed.split(/[.!?…]\s+/).pop() || '';
    if (lastSentence.trim().length < 10) return false;
    
    // Verifica che non finisca con parole incomplete comuni
    const incompleteWords = ['e', 'o', 'a', 'il', 'la', 'lo', 'gli', 'le', 'un', 'una', 'uno', 'di', 'da', 'in', 'su', 'per', 'con', 'tra', 'fra'];
    const lastWords = trimmed.split(/\s+/).slice(-3);
    if (lastWords.length > 0 && incompleteWords.includes(lastWords[lastWords.length - 1].toLowerCase().replace(/[.,!?;:…]/g, ''))) {
      return false;
    }
    
    return true;
  };

  // Funzione per assicurarsi che il contenuto finisca correttamente
  const ensureCompleteContent = (content: string): string => {
    if (!content || !content.trim()) return content;
    
    let cleaned = content.trim().replace(/\s+$/, '');
    
    // Se il contenuto è già completo, restituiscilo
    if (isContentComplete(cleaned)) {
      return cleaned;
    }
    
    // Cerca l'ultima frase completa
    const sentences = cleaned.split(/([.!?…]\s+)/);
    let completeText = '';
    
    // Prendi tutte le frasi complete
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '';
      
      if (sentence && sentence.trim().length > 10) {
        completeText += sentence + punctuation;
      } else {
        break;
      }
    }
    
    // Se abbiamo trovato frasi complete, usale
    if (completeText.trim().length > 0) {
      cleaned = completeText.trim();
    }
    
    // Verifica che finisca con punteggiatura
    const endsWithPunctuation = /[.!?…]\s*$/.test(cleaned);
    if (!endsWithPunctuation) {
      cleaned = cleaned + '.';
    }
    
    // Rimuovi punteggiatura incompleta finale
    const incompletePatterns = [
      /,\s*$/,
      /;\s*$/,
      /:\s*$/,
      /-\s*$/,
    ];
    
    for (const pattern of incompletePatterns) {
      if (pattern.test(cleaned)) {
        cleaned = cleaned.replace(pattern, '').trim() + '.';
        break;
      }
    }
    
    return cleaned.trim();
  };

  const generateArticleContent = async (
    prompt: string, 
    targetWords: number, 
    type: string, 
    maxRetries: number = 2,
    onProgress?: (progress: number, message?: string) => void
  ) => {
    const typeLabels: Record<string, string> = {
      article: 'articolo',
      essay: 'saggio',
      blog: 'post per blog',
      story: 'racconto',
    };

    const typeInstructions: Record<string, string> = {
      article: `Scrivi un articolo ben strutturato con:
- INTRODUZIONE: Presenta il tema in modo coinvolgente
- CORPO PRINCIPALE: Sviluppa l'argomento con paragrafi chiari e ben organizzati, ognuno con un'idea principale
- CONCLUSIONE: Concludi con un paragrafo finale che riassuma i punti chiave e offra una riflessione finale o un invito all'azione
Usa uno stile informativo ma coinvolgente.`,
      essay: `Scrivi un saggio argomentativo con:
- TESI: Presenta chiaramente la tua posizione
- ARGOMENTAZIONI: Sviluppa i tuoi argomenti con esempi e ragionamenti logici
- CONCLUSIONE: Concludi riassumendo la tesi e rafforzando la tua posizione con una riflessione finale
Mantieni uno stile formale e accademico.`,
      blog: `Scrivi un post per blog con:
- APERTURA: Cattura l'attenzione con un inizio coinvolgente
- SVILUPPO: Esponi il contenuto principale con paragrafi brevi e chiari
- CHIUSURA: Concludi con una riflessione personale, un invito all'azione o una domanda per i lettori
Usa uno stile conversazionale e coinvolgente con paragrafi brevi.`,
      story: `Scrivi un racconto narrativo con:
- INIZIO: Presenta personaggi e ambientazione
- SVILUPPO: Costruisci la trama con eventi e conflitti
- CONCLUSIONE: Concludi con una risoluzione soddisfacente che dia senso alla storia
Usa descrizioni vivide e dialoghi naturali.`,
    };

    const conclusionInstructions: Record<string, string> = {
      article: 'La conclusione deve riassumere i punti principali e offrire una riflessione finale o un invito all\'azione.',
      essay: 'La conclusione deve riaffermare la tesi e offrire una riflessione finale che rafforzi la posizione argomentata.',
      blog: 'La conclusione deve essere coinvolgente, possibilmente con una domanda per i lettori o un invito all\'azione.',
      story: 'La conclusione deve risolvere la trama in modo soddisfacente, dando un senso di completezza alla storia.',
    };

    // Calcola max_tokens in base al numero di parole richieste (circa 1.3 token per parola)
    const estimatedTokens = Math.ceil(targetWords * 1.3);
    const maxTokens = Math.min(Math.max(estimatedTokens, 2000), 4000); // Minimo 2000, massimo 4000

    const articlePrompt = `Crea un ${typeLabels[type]} completo e ben strutturato basato su questo tema: "${prompt}"

${typeInstructions[type]}

REQUISITI FONDAMENTALI:
1. LUNGHEZZA: Il testo deve essere di circa ${targetWords} parole (minimo ${Math.floor(targetWords * 0.8)}, massimo ${Math.floor(targetWords * 1.2)})
2. STRUTTURA: Deve essere ben organizzato con paragrafi chiari, ognuno con un'idea principale ben sviluppata
3. CONCLUSIONE OBBLIGATORIA: ${conclusionInstructions[type]} Il testo DEVE terminare con un paragrafo conclusivo completo e soddisfacente
4. COMPLETEZZA: 
   - Il testo DEVE finire sempre con una frase completa e grammaticalmente corretta
   - L'ultima frase DEVE terminare con punteggiatura appropriata (punto, punto esclamativo, o punto interrogativo)
   - NON interrompere mai a metà frase, a metà pensiero o con punteggiatura incompleta (virgola, due punti, trattino)
   - L'ultima frase deve avere senso logico e completare il pensiero
5. COERENZA: Tutto il testo deve essere coerente, logico e ben connesso dall'inizio alla fine

IMPORTANTE: Assicurati di scrivere TUTTO il testo richiesto, inclusa una conclusione appropriata e completa. Non fermarti a metà.`;

    let content = '';
    let totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 };
    let attempts = 0;

    while (attempts < maxRetries && (!content || !isContentComplete(content))) {
      attempts++;
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: attempts === 1 
            ? articlePrompt 
            : `${articlePrompt}\n\nIMPORTANTE: Il testo precedente è stato troncato. Completa il testo con una conclusione appropriata e completa. Assicurati che l'ultima frase sia completa e termini con punteggiatura corretta.`,
          context: attempts > 1 ? content.substring(0, 2000) : '',
          projectId: currentProject?.id,
          maxTokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione');
      }

      const data = await response.json();
      const newContent = data.content.trim();
      
      // Aggiorna il progresso
      if (onProgress) {
        const baseProgress = attempts === 1 ? 30 : 60;
        onProgress(baseProgress, attempts === 1 ? 'Generando il testo...' : 'Completando il testo...');
      }
      
      // Accumula l'uso
      if (data.usage) {
        totalUsage.inputTokens += data.usage.inputTokens || 0;
        totalUsage.outputTokens += data.usage.outputTokens || 0;
        totalUsage.totalTokens += data.usage.totalTokens || 0;
        totalUsage.cost += data.usage.cost || 0;
      }
      
      if (attempts === 1) {
        content = newContent;
      } else {
        // Se è un tentativo di completamento, aggiungi solo la parte nuova
        const existingLength = content.length;
        const overlap = Math.min(200, existingLength); // Evita sovrapposizioni
        content = content.substring(0, existingLength - overlap) + '\n\n' + newContent;
      }
      
      // Verifica se il contenuto è completo
      if (isContentComplete(content)) {
        if (onProgress) {
          onProgress(80, 'Testo completato!');
        }
        break;
      }
      
      // Se non è completo e abbiamo ancora tentativi, prova a completarlo
      if (attempts < maxRetries && !isContentComplete(content)) {
        if (onProgress) {
          onProgress(50, 'Verificando completezza...');
        }
        // Prendi le ultime frasi per il contesto (circa 800 caratteri)
        const contextText = content.substring(Math.max(0, content.length - 800));
        
        // Rimuovi l'ultima frase incompleta se presente
        const sentences = contextText.split(/([.!?…]\s+)/);
        let cleanContext = '';
        for (let i = 0; i < sentences.length - 2; i += 2) {
          if (sentences[i]) {
            cleanContext += sentences[i] + (sentences[i + 1] || '');
          }
        }
        
        const completionPrompt = `Il seguente testo è incompleto. Completa SOLO la parte mancante con una conclusione appropriata e completa. Non riscrivere il testo esistente.

Testo esistente (ultime frasi):
${cleanContext || contextText}

Completa il testo con una conclusione che:
1. Sia logica e coerente con il resto del testo
2. Termini con una frase completa e grammaticalmente corretta
3. Finisca con punteggiatura appropriata (punto, punto esclamativo, o punto interrogativo)
4. Dia un senso di completezza e soddisfazione al lettore

Scrivi SOLO la parte mancante (la conclusione), senza ripetere il testo esistente.`;

        const completionResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: completionPrompt,
            context: content.substring(0, 1500),
            projectId: currentProject?.id,
            maxTokens: 1000,
          }),
        });

        if (completionResponse.ok) {
          const completionData = await completionResponse.json();
          let completion = completionData.content.trim();
          
          // Rimuovi eventuali duplicazioni all'inizio del completamento
          const lastWords = content.trim().split(/\s+/).slice(-5).join(' ');
          if (completion.toLowerCase().startsWith(lastWords.toLowerCase().substring(0, 20))) {
            // Rimuovi la parte duplicata
            const words = completion.split(/\s+/);
            const lastWordsArray = lastWords.split(/\s+/);
            let skipIndex = 0;
            for (let i = 0; i < words.length && skipIndex < lastWordsArray.length; i++) {
              if (words[i].toLowerCase() === lastWordsArray[skipIndex].toLowerCase()) {
                skipIndex++;
              } else {
                break;
              }
            }
            completion = words.slice(skipIndex).join(' ');
          }
          
          if (completionData.usage) {
            totalUsage.inputTokens += completionData.usage.inputTokens || 0;
            totalUsage.outputTokens += completionData.usage.outputTokens || 0;
            totalUsage.totalTokens += completionData.usage.totalTokens || 0;
            totalUsage.cost += completionData.usage.cost || 0;
          }
          
          // Aggiungi il completamento al contenuto solo se non è vuoto
          if (completion.trim().length > 0) {
            // Rimuovi l'ultima frase incompleta dal contenuto esistente
            const contentSentences = content.split(/([.!?…]\s+)/);
            let completeContent = '';
            for (let i = 0; i < contentSentences.length - 2; i += 2) {
              if (contentSentences[i]) {
                completeContent += contentSentences[i] + (contentSentences[i + 1] || '');
              }
            }
            
            content = (completeContent || content).trim() + ' ' + completion.trim();
            
            if (onProgress) {
              onProgress(75, 'Completamento aggiunto...');
            }
          }
          
          if (isContentComplete(content)) {
            if (onProgress) {
              onProgress(85, 'Testo completato!');
            }
            break;
          }
        }
      }
    }
    
    // Applica la funzione di completamento finale come fallback
    if (onProgress) {
      onProgress(90, 'Finalizzazione...');
    }
    content = ensureCompleteContent(content);
    
    if (onProgress) {
      onProgress(95, 'Completato!');
    }
    
    return { content, usage: totalUsage };
  };

  const handleStartGeneration = async () => {
    if (!articlePrompt.trim()) {
      setError('Inserisci un tema o una descrizione per il testo');
      return;
    }

    setError(null);
    setStep('generating');
    setIsGenerating(true);
    setProgress(0);

    try {
      // Crea o usa il progetto corrente
      let project = currentProject;
      if (!project) {
        const projectTitle = articleTitle || `${articleType === 'article' ? 'Articolo' : articleType === 'essay' ? 'Saggio' : articleType === 'blog' ? 'Post Blog' : 'Racconto'} - ${new Date().toLocaleDateString()}`;
        createProject(projectTitle);
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

      setProgress(20);

      // Genera il contenuto con callback per aggiornare il progresso
      const result = await generateArticleContent(
        articlePrompt, 
        wordCount, 
        articleType,
        2, // maxRetries
        (progressValue: number, message?: string) => {
          setProgress(progressValue);
          // Il messaggio può essere usato in futuro per mostrare lo stato
        }
      );
      setProgress(90);

      setGeneratedContent(result.content);

      // Aggiorna il progetto con il contenuto generato
      const finalTitle = articleTitle || `${articleType === 'article' ? 'Articolo' : articleType === 'essay' ? 'Saggio' : articleType === 'blog' ? 'Post Blog' : 'Racconto'} - ${new Date().toLocaleDateString()}`;
      
      updateProject(project.id, {
        title: finalTitle,
        content: result.content,
      });

      // Salva nella memoria AI
      if (result.usage) {
        const { addCreditUsage } = useStore.getState();
        addCreditUsage(result.usage.totalTokens, result.usage.cost);
        
        if (typeof window !== 'undefined') {
          memoryManager.addConversation(
            project.id,
            articlePrompt,
            result.content,
            result.usage.totalTokens,
            result.usage.cost
          );
        }
      }

      setProgress(100);
      setStep('complete');
    } catch (error: any) {
      console.error('Errore:', error);
      setError(error.message || 'Errore nella generazione del testo');
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
              onClick={() => router.push('/projects')}
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
              Torna ai Progetti
            </button>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              Crea un Articolo o Testo
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Genera automaticamente un testo completo partendo da un'idea o un tema
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
                    Tema o Descrizione del Testo *
                  </label>
                  <textarea
                    value={articlePrompt}
                    onChange={(e) => setArticlePrompt(e.target.value)}
                    placeholder="Es: Un articolo sull'importanza della sostenibilità ambientale e come le aziende possono adottare pratiche eco-friendly..."
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
                    Descrivi il tema, l'argomento o l'idea principale del testo che vuoi creare
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                    Tipo di Testo
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['article', 'essay', 'blog', 'story'] as const).map((type) => {
                      const labels: Record<string, string> = {
                        article: 'Articolo',
                        essay: 'Saggio',
                        blog: 'Post Blog',
                        story: 'Racconto',
                      };
                      return (
                        <button
                          key={type}
                          onClick={() => setArticleType(type)}
                          className={`px-4 py-3 rounded-lg border transition-colors ${
                            articleType === type ? 'shadow-md' : ''
                          }`}
                          style={{
                            borderColor: articleType === type ? 'var(--accent)' : 'var(--border)',
                            backgroundColor: articleType === type ? 'rgba(139, 111, 71, 0.1)' : 'transparent',
                            color: 'var(--foreground)',
                          }}
                          onMouseEnter={(e) => {
                            if (articleType !== type) {
                              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (articleType !== type) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {labels[type]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                    Numero di Parole
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <div className="w-32 text-center">
                      <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                        {wordCount.toLocaleString()}
                      </span>
                      <span className="text-sm ml-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        parole
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                    Circa {Math.floor(wordCount / 250)} pagine verranno generate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                    Titolo (opzionale)
                  </label>
                  <input
                    type="text"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Lascia vuoto per generare automaticamente"
                    className="w-full px-4 py-3 border rounded-lg transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
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
                </div>

                {error && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleStartGeneration}
                  disabled={!articlePrompt.trim()}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent)' }}
                  onMouseEnter={(e) => {
                    if (articlePrompt.trim()) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Sparkles size={20} />
                  <span className="text-lg font-semibold">Genera Testo</span>
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
                    Sto creando il tuo testo...
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
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 'complete' && generatedContent && (
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
                    Testo Generato con Successo!
                  </h2>
                  <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Il tuo testo è stato salvato come progetto
                  </p>
                </div>

                <div className="text-left space-y-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                      Anteprima:
                    </h3>
                    <div 
                      className="prose max-w-none whitespace-pre-wrap"
                      style={{ 
                        color: 'var(--foreground)', 
                        opacity: 0.8,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        lineHeight: '1.8',
                        fontSize: '1rem'
                      }}
                    >
                      {generatedContent.substring(0, 1000)}
                      {generatedContent.length > 1000 && '...'}
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                      {generatedContent.split(' ').length} parole totali
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/projects')}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors shadow-md"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <FileText size={20} />
                    Vai ai Progetti
                  </button>
                  <button
                    onClick={() => {
                      setStep('input');
                      setArticlePrompt('');
                      setGeneratedContent('');
                      setProgress(0);
                      setArticleTitle('');
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
                    Crea un Altro Testo
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

