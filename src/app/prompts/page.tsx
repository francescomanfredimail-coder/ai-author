'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useStore } from '@/lib/store';
import { Sparkles, BookOpen, MessageSquare, FileText, Settings, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  template: string;
  category: 'chapter' | 'dialogue' | 'description' | 'plot';
}

const promptTemplates: PromptTemplate[] = [
  {
    id: 'chapter',
    title: 'Genera Capitolo',
    description: 'Crea un nuovo capitolo per il tuo libro',
    icon: BookOpen,
    category: 'chapter',
    template: 'Scrivi un capitolo su: [ARGOMENTO]. Il capitolo dovrebbe essere lungo circa [LUNGHEZZA] parole, con tono [TONO] e stile [STILE].',
  },
  {
    id: 'dialogue',
    title: 'Crea Dialogo',
    description: 'Genera un dialogo tra personaggi',
    icon: MessageSquare,
    category: 'dialogue',
    template: 'Crea un dialogo tra [PERSONAGGIO1] e [PERSONAGGIO2] su [ARGOMENTO]. Il dialogo dovrebbe essere [CARATTERISTICHE].',
  },
  {
    id: 'description',
    title: 'Descrizione',
    description: 'Genera una descrizione dettagliata',
    icon: FileText,
    category: 'description',
    template: 'Scrivi una descrizione dettagliata di [OGGETTO/LUOGO/PERSONAGGIO]. Includi dettagli sensoriali e atmosfera.',
  },
  {
    id: 'plot',
    title: 'Sviluppa Trama',
    description: 'Espandi e sviluppa elementi della trama',
    icon: Sparkles,
    category: 'plot',
    template: 'Sviluppa la trama per [SCENARIO]. Includi conflitti, sviluppo dei personaggi e risoluzione.',
  },
];

export default function PromptsPage() {
  const router = useRouter();
  const { currentProject } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [customizations, setCustomizations] = useState({
    tone: 'professionale',
    style: 'narrativo',
    targetAudience: 'adulti',
    length: '500',
  });

  const handleUsePrompt = () => {
    if (!selectedTemplate) {
      alert('Seleziona un template per continuare');
      return;
    }

    let prompt = selectedTemplate.template;
    
    // Sostituisci placeholder con valori personalizzati
    prompt = prompt.replace('[TONO]', customizations.tone);
    prompt = prompt.replace('[STILE]', customizations.style);
    prompt = prompt.replace('[LUNGHEZZA]', customizations.length);

    // Naviga all'editor con il prompt precompilato
    // Se c'è un progetto corrente, lo usa, altrimenti ne crea uno nuovo
    if (currentProject) {
      router.push(`/editor?project=${currentProject.id}&prompt=${encodeURIComponent(prompt)}`);
    } else {
      router.push(`/editor?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <Layout>
      <div className="p-8" style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
            Prompt Guidati
          </h1>
          <p style={{ color: 'var(--foreground)', opacity: 0.7 }}>
            Usa questi template predefiniti per generare contenuti specifici
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {promptTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="p-6 rounded-lg border-2 transition-all text-left shadow-md"
                style={{
                  borderColor: selectedTemplate?.id === template.id ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: selectedTemplate?.id === template.id ? 'rgba(139, 111, 71, 0.1)' : 'var(--paper)',
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate?.id !== template.id) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate?.id !== template.id) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'var(--paper)';
                  }
                }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 111, 71, 0.2)' }}>
                    <Icon size={24} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>{template.title}</h3>
                    <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{template.description}</p>
                  </div>
                </div>
                <p className="text-sm italic" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                  {template.template}
                </p>
              </button>
            );
          })}
        </div>

        {selectedTemplate && (
          <div 
            className="p-6 rounded-lg border shadow-md"
            style={{ 
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--border)'
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
              Personalizza: {selectedTemplate.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>Tono</label>
                <select
                  value={customizations.tone}
                  onChange={(e) =>
                    setCustomizations({ ...customizations, tone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="professionale">Professionale</option>
                  <option value="informale">Informale</option>
                  <option value="poetico">Poetico</option>
                  <option value="drammatico">Drammatico</option>
                  <option value="umoristico">Umoristico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>Stile</label>
                <select
                  value={customizations.style}
                  onChange={(e) =>
                    setCustomizations({ ...customizations, style: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="narrativo">Narrativo</option>
                  <option value="descrittivo">Descrittivo</option>
                  <option value="dialogico">Dialogico</option>
                  <option value="espositivo">Espositivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                  Target Lettori
                </label>
                <select
                  value={customizations.targetAudience}
                  onChange={(e) =>
                    setCustomizations({
                      ...customizations,
                      targetAudience: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option value="adulti">Adulti</option>
                  <option value="giovani">Giovani Adulti</option>
                  <option value="ragazzi">Ragazzi</option>
                  <option value="bambini">Bambini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--accent)' }}>
                  Lunghezza (parole)
                </label>
                <input
                  type="number"
                  value={customizations.length}
                  onChange={(e) =>
                    setCustomizations({
                      ...customizations,
                      length: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)'
                  }}
                  min="100"
                  max="5000"
                />
              </div>
            </div>

            <button
              onClick={handleUsePrompt}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors shadow-md"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <Sparkles size={18} />
              Usa questo Prompt
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

