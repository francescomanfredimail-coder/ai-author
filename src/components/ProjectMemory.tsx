'use client';

import { useState, useEffect } from 'react';
import { memoryManager } from '@/lib/memory';
import { History, MessageSquare, Trash2 } from 'lucide-react';

interface ProjectMemoryProps {
  projectId: string;
}

export function ProjectMemory({ projectId }: ProjectMemoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isOpen && projectId) {
      try {
        const history = memoryManager.getConversationHistory(projectId, 20);
        setConversations(history);
      } catch (error) {
        console.error('Errore nel caricamento della memoria:', error);
      }
    }
  }, [isMounted, isOpen, projectId]);

  if (!projectId || !isMounted) return null;

  let memory = null;
  let hasMemory = false;
  try {
    memory = memoryManager.getMemory(projectId);
    hasMemory = !!(memory && memory.conversations.length > 0);
  } catch (error) {
    console.error('Errore nell\'accesso alla memoria:', error);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors shadow-sm"
        style={{ 
          backgroundColor: 'var(--accent)',
          color: '#fff'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        title="Storico conversazioni AI"
      >
        <History size={16} />
        <span>Memoria ({memory?.conversations.length || 0})</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-96 rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden flex flex-col"
          style={{ 
            backgroundColor: 'var(--paper)',
            borderColor: 'var(--border)'
          }}
        >
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              <MessageSquare size={18} />
              Storico Conversazioni
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="transition-colors"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!hasMemory ? (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                <p>Nessuna conversazione salvata</p>
                <p className="text-xs mt-2">Le conversazioni con l'AI verranno salvate qui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg text-sm shadow-sm"
                    style={{ backgroundColor: 'var(--background)' }}
                  >
                    <div className="mb-2">
                      <p className="font-medium text-xs mb-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                        {new Date(conv.timestamp).toLocaleString('it-IT')}
                      </p>
                      <p className="mb-2" style={{ color: 'var(--foreground)' }}>
                        <span className="font-semibold" style={{ color: 'var(--accent)' }}>Q:</span> {conv.prompt.substring(0, 100)}
                        {conv.prompt.length > 100 ? '...' : ''}
                      </p>
                      <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
                        <span className="font-semibold" style={{ color: 'var(--accent)' }}>A:</span> {conv.response.substring(0, 150)}
                        {conv.response.length > 150 ? '...' : ''}
                      </p>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                      {conv.tokens} token • ${conv.cost.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

