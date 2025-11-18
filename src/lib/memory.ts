import { Project } from './store';

export interface AIMemory {
  projectId: string;
  conversations: Conversation[];
  context: string;
  lastUpdated: string;
}

export interface Conversation {
  id: string;
  timestamp: string;
  prompt: string;
  response: string;
  tokens: number;
  cost: number;
}

class MemoryManager {
  private static instance: MemoryManager;
  private memories: Map<string, AIMemory> = new Map();

  private constructor() {
    this.loadMemories();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private getStorageKey(): string {
    if (typeof window === 'undefined') return 'ai-memories';
    const username = localStorage.getItem('lama-bollente-auth');
    // L'admin accede ai dati senza prefisso (dati esistenti)
    if (username === 'admin') {
      return 'ai-memories';
    }
    return username ? `ai-memories-${username}` : 'ai-memories';
  }

  private loadMemories() {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = this.getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.memories = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Errore nel caricamento delle memorie:', error);
    }
  }

  private saveMemories() {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = this.getStorageKey();
      const toSave = Object.fromEntries(this.memories);
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch (error) {
      console.error('Errore nel salvataggio delle memorie:', error);
    }
  }

  // Ricarica le memorie quando cambia utente
  reloadForUser() {
    this.memories.clear();
    this.loadMemories();
  }

  getMemory(projectId: string): AIMemory | null {
    return this.memories.get(projectId) || null;
  }

  createMemory(projectId: string, project: Project): AIMemory {
    const memory: AIMemory = {
      projectId,
      conversations: [],
      context: project.content || '',
      lastUpdated: new Date().toISOString(),
    };
    this.memories.set(projectId, memory);
    this.saveMemories();
    return memory;
  }

  addConversation(projectId: string, prompt: string, response: string, tokens: number, cost: number) {
    let memory = this.memories.get(projectId);
    
    if (!memory) {
      // Crea una memoria base se non esiste
      memory = {
        projectId,
        conversations: [],
        context: '',
        lastUpdated: new Date().toISOString(),
      };
      this.memories.set(projectId, memory);
    }

    const conversation: Conversation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      prompt,
      response,
      tokens,
      cost,
    };

    memory.conversations.push(conversation);
    memory.context = response; // Aggiorna il contesto con l'ultima risposta
    memory.lastUpdated = new Date().toISOString();
    
    // Mantieni solo le ultime 50 conversazioni per progetto
    if (memory.conversations.length > 50) {
      memory.conversations = memory.conversations.slice(-50);
    }

    this.saveMemories();
    return conversation;
  }

  updateContext(projectId: string, context: string) {
    let memory = this.memories.get(projectId);
    
    if (!memory) {
      memory = {
        projectId,
        conversations: [],
        context,
        lastUpdated: new Date().toISOString(),
      };
      this.memories.set(projectId, memory);
    } else {
      memory.context = context;
      memory.lastUpdated = new Date().toISOString();
    }

    this.saveMemories();
  }

  getContext(projectId: string): string {
    const memory = this.memories.get(projectId);
    if (!memory) return '';

    // Costruisci il contesto dalle ultime conversazioni
    const recentConversations = memory.conversations.slice(-5);
    const contextParts = [
      memory.context,
      ...recentConversations.map(c => `Q: ${c.prompt}\nA: ${c.response}`),
    ].filter(Boolean);

    return contextParts.join('\n\n');
  }

  getConversationHistory(projectId: string, limit: number = 10): Conversation[] {
    const memory = this.memories.get(projectId);
    if (!memory) return [];
    
    return memory.conversations.slice(-limit);
  }

  deleteMemory(projectId: string) {
    this.memories.delete(projectId);
    this.saveMemories();
  }

  getAllMemories(): AIMemory[] {
    return Array.from(this.memories.values());
  }

  clearAllMemories() {
    this.memories.clear();
    this.saveMemories();
  }
}

export const memoryManager = MemoryManager.getInstance();

