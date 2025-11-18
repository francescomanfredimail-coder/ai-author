import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { memoryManager } from './memory';

export interface Project {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string per persistenza
  updatedAt: string; // ISO string per persistenza
  metadata?: {
    tone?: string;
    style?: string;
    targetAudience?: string;
    wordCount?: number;
  };
}

export interface CreditUsage {
  tokens: number;
  cost: number;
  timestamp: string; // ISO string per persistenza
}

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  creditUsage: CreditUsage[];
  totalCreditsUsed: number;
  
  // Actions
  createProject: (title: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  addCreditUsage: (tokens: number, cost: number) => void;
  resetCredits: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      projects: [],
      currentProject: null,
      creditUsage: [],
      totalCreditsUsed: 0,

      createProject: (title: string) => {
        const now = new Date().toISOString();
        const newProject: Project = {
          id: Date.now().toString(),
          title,
          content: '',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }));
        // Crea memoria per il nuovo progetto
        if (typeof window !== 'undefined') {
          memoryManager.createMemory(newProject.id, newProject);
        }
      },

      updateProject: (id: string, updates: Partial<Project>) => {
        const now = new Date().toISOString();
        set((state) => {
          const updatedProject = state.projects.find((p) => p.id === id);
          const newProject = updatedProject
            ? { ...updatedProject, ...updates, updatedAt: now }
            : null;

          // Aggiorna il contesto nella memoria se il contenuto cambia
          if (typeof window !== 'undefined' && updates.content !== undefined && newProject) {
            memoryManager.updateContext(id, updates.content);
          }

          return {
            projects: state.projects.map((p) =>
              p.id === id
                ? { ...p, ...updates, updatedAt: now }
                : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, ...updates, updatedAt: now }
                : state.currentProject,
          };
        });
      },

      deleteProject: (id: string) => {
        // Elimina prima la memoria associata
        if (typeof window !== 'undefined') {
          try {
            memoryManager.deleteMemory(id);
          } catch (error) {
            console.error('Errore nella cancellazione della memoria:', error);
          }
        }
        
        // Poi elimina il progetto dallo store
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);
          const newCurrentProject = state.currentProject?.id === id ? null : state.currentProject;
          
          return {
            projects: newProjects,
            currentProject: newCurrentProject,
          };
        });
      },

      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },

      addCreditUsage: (tokens: number, cost: number) => {
        set((state) => ({
          creditUsage: [
            ...state.creditUsage,
            { tokens, cost, timestamp: new Date().toISOString() },
          ],
          totalCreditsUsed: state.totalCreditsUsed + cost,
        }));
      },

      resetCredits: () => {
        set({ creditUsage: [], totalCreditsUsed: 0 });
      },
    }),
    {
      name: 'ai-author-storage',
      skipHydration: true, // Evita problemi di idratazione
    }
  )
);

// Funzione per idratare lo store dopo il mount
if (typeof window !== 'undefined') {
  useStore.persist.rehydrate();
}

