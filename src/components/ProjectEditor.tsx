'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { TextEditor } from './TextEditor';
import { ClientOnly } from './ClientOnly';
import { ExportButton } from './ExportButton';
import { QualityCheck } from './QualityCheck';
import { ProjectMemory } from './ProjectMemory';
import { Save, Sparkles, Loader2, AlertCircle, X, Eye, Edit2, Wand2 } from 'lucide-react';
import { memoryManager } from '@/lib/memory';

interface ProjectEditorProps {
  projectId: string;
  onClose: () => void;
  mode?: 'view' | 'edit';
}

export function ProjectEditor({ projectId, onClose, mode: initialMode = 'view' }: ProjectEditorProps) {
  const { projects, currentProject, setCurrentProject, updateProject, createProject } = useStore();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      useStore.persist.rehydrate();
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      setContent(project.content);
      setTitle(project.title);
      
      if (typeof window !== 'undefined') {
        if (!memoryManager.getMemory(project.id)) {
          memoryManager.createMemory(project.id, project);
        }
      }
    }
  }, [projectId, projects, isMounted, setCurrentProject]);

  const handleSave = () => {
    if (currentProject) {
      updateProject(currentProject.id, { content, title });
      alert('Progetto salvato con successo!');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Inserisci un prompt per generare il contenuto');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let fullContext = content || '';
      if (currentProject) {
        const memoryContext = memoryManager.getContext(currentProject.id);
        if (memoryContext) {
          fullContext = memoryContext + (content ? `\n\n${content}` : '');
        }
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: fullContext,
          projectId: currentProject?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione');
      }

      const data = await response.json();
      const newContent = content ? `${content}\n\n${data.content}` : data.content;
      setContent(newContent);

      if (currentProject) {
        updateProject(currentProject.id, { content: newContent });
      }

      if (data.usage) {
        const { addCreditUsage } = useStore.getState();
        addCreditUsage(data.usage.totalTokens, data.usage.cost);
      }

      if (currentProject && data.usage) {
        memoryManager.addConversation(
          currentProject.id,
          prompt,
          data.content,
          data.usage.totalTokens,
          data.usage.cost
        );
      }

      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isMounted || !currentProject) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </div>
    );
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: 'var(--paper)' }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1">
            {mode === 'edit' ? (
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  updateProject(currentProject.id, { title: e.target.value });
                }}
                className="text-2xl font-bold bg-transparent border-none outline-none w-full mb-2"
                style={{ 
                  color: 'var(--accent)',
                  fontFamily: 'Georgia, serif'
                }}
                placeholder="Titolo del progetto..."
              />
            ) : (
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
                {title || currentProject.title}
              </h2>
            )}
            <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
              {wordCount} parole • Ultimo salvataggio: {new Date(currentProject.updatedAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--accent)'
              }}
            >
              {mode === 'view' ? <Edit2 size={18} /> : <Eye size={18} />}
              {mode === 'view' ? 'Modifica' : 'Visualizza'}
            </button>
            {currentProject && (
              <ClientOnly>
                <ProjectMemory projectId={currentProject.id} />
              </ClientOnly>
            )}
            <ExportButton title={title || 'Documento'} content={content} />
            {mode === 'edit' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-md"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Save size={18} />
                Salva
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'view' ? (
            <div 
              className="prose prose-lg max-w-none p-6 rounded-lg"
              style={{ backgroundColor: 'var(--background)' }}
            >
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                  Il progetto è ancora vuoto. Passa in modalità modifica per iniziare a scrivere.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Prompt Input */}
              <div 
                className="mb-6 p-4 rounded-lg border shadow-md"
                style={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)'
                }}
              >
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                  Prompt per l'AI
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="Es: Scrivi un capitolo su..."
                    className="flex-1 px-4 py-2 border rounded-lg transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--paper)',
                      color: 'var(--foreground)'
                    }}
                    disabled={isGenerating}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Genera
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="mb-6">
                <ClientOnly>
                  <TextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Inizia a scrivere o usa il prompt sopra per generare contenuto con l'AI..."
                  />
                </ClientOnly>
              </div>

              {/* Quality Check */}
              <QualityCheck content={content} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

