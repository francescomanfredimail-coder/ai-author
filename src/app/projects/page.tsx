'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { BookOpen, Trash2, Edit, FileText, Plus, Wand2 } from 'lucide-react';
import { ProjectEditor } from '@/components/ProjectEditor';

export default function ProjectsPage() {
  const { projects, deleteProject, setCurrentProject, createProject } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<'view' | 'edit'>('view');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      useStore.persist.rehydrate();
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
      deleteProject(id);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          useStore.persist.rehydrate();
        }
      }, 100);
    }
  };

  const handleOpen = (projectId: string, mode: 'view' | 'edit' = 'view') => {
    setSelectedProjectId(projectId);
    setEditorMode(mode);
  };

  const handleCreateProject = () => {
    const newTitle = `Nuovo Progetto ${new Date().toLocaleDateString()}`;
    createProject(newTitle);
    const newProject = useStore.getState().currentProject;
    if (newProject) {
      setSelectedProjectId(newProject.id);
      setEditorMode('edit');
    }
  };

  if (!isMounted) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
          <div className="text-center">
            <p style={{ color: 'var(--foreground)', opacity: 0.6 }}>Caricamento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8" style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              I Miei Progetti
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Gestisci, modifica e revisiona tutti i tuoi progetti di scrittura
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors shadow-md"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            <Plus size={20} />
            Nuovo Progetto
          </button>
        </div>

        {/* Barra di ricerca e filtri */}
        {projects.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm mb-1" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                  {projects.length} {projects.length === 1 ? 'progetto' : 'progetti'} totali
                </p>
              </div>
              <button
                onClick={() => {
                  const sorted = [...projects].sort((a, b) => 
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                  );
                  sorted.forEach(p => setCurrentProject(p));
                }}
                className="px-4 py-2 text-sm rounded-lg border transition-colors"
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
                Ordina per Data
              </button>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div 
            className="text-center py-20 rounded-lg border shadow-md"
            style={{ 
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--border)'
            }}
          >
            <BookOpen className="mx-auto mb-4" size={64} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Nessun progetto ancora</h2>
            <p style={{ color: 'var(--foreground)', opacity: 0.6, marginBottom: '1.5rem' }}>
              Inizia creando il tuo primo progetto di scrittura
            </p>
            <button
              onClick={handleCreateProject}
              className="inline-block px-6 py-3 text-white rounded-lg transition-colors shadow-md"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Crea Progetto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const wordCount = project.content.split(/\s+/).filter(Boolean).length;
              return (
                <div
                  key={project.id}
                  className="p-6 rounded-lg border shadow-md transition-all"
                  style={{ 
                    backgroundColor: 'var(--paper)',
                    borderColor: 'var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--foreground)' }}>{project.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        {format(new Date(project.updatedAt), 'dd MMMM yyyy', { locale: it })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="p-2 text-red-600 rounded transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Elimina progetto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-4" style={{ color: 'var(--accent)' }}>
                    <div className="flex items-center gap-1">
                      <FileText size={16} />
                      <span>{wordCount} parole</span>
                    </div>
                  </div>

                  <div className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    {project.content.substring(0, 150)}
                    {project.content.length > 150 ? '...' : ''}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setCurrentProject(project);
                        handleOpen(project.id, 'view');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm"
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
                      <BookOpen size={14} />
                      Visualizza
                    </button>
                    <button
                      onClick={() => {
                        setCurrentProject(project);
                        handleOpen(project.id, 'edit');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm shadow-md"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: '#fff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <Edit size={14} />
                      Modifica
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale Editor */}
      {selectedProjectId && (
        <ProjectEditor
          projectId={selectedProjectId}
          mode={editorMode}
          onClose={() => {
            setSelectedProjectId(null);
            setCurrentProject(null);
          }}
        />
      )}
    </Layout>
  );
}
