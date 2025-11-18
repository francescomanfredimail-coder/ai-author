'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, BookOpen, File, Loader2, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

interface ExportButtonProps {
  title: string;
  content: string;
}

export function ExportButton({ title, content }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Rimuove i tag HTML e mantiene solo il testo formattato
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Converte HTML in testo semplice mantenendo la struttura
  const htmlToPlainText = (html: string): string => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    
    // Converte i tag in testo formattato
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        const children = Array.from(node.childNodes)
          .map(processNode)
          .join('');
        
        switch (tagName) {
          case 'h1':
            return `\n\n${children}\n\n`;
          case 'h2':
            return `\n\n${children}\n\n`;
          case 'h3':
            return `\n\n${children}\n\n`;
          case 'p':
            return `${children}\n\n`;
          case 'strong':
          case 'b':
            return `**${children}**`;
          case 'em':
          case 'i':
            return `*${children}*`;
          case 'li':
            return `• ${children}\n`;
          case 'br':
            return '\n';
          default:
            return children;
        }
      }
      
      return '';
    };
    
    return processNode(tmp);
  };

  const exportToPDF = async () => {
    setIsExporting('pdf');
    try {
      const pdf = new jsPDF();
      const text = htmlToPlainText(content);
      
      // Aggiungi il titolo
      pdf.setFontSize(20);
      pdf.text(title, 20, 20);
      
      // Aggiungi il contenuto
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(text, 170);
      let y = 40;
      
      lines.forEach((line: string) => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 20, y);
        y += 7;
      });
      
      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error('Errore nell\'esportazione PDF:', error);
      alert('Errore nell\'esportazione PDF');
    } finally {
      setIsExporting(null);
    }
  };

  const exportToDOCX = async () => {
    setIsExporting('docx');
    try {
      const text = stripHtml(content);
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: title,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 400 },
              }),
              ...paragraphs.map(
                (para) =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: para.trim(),
                        size: 24, // 12pt
                      }),
                    ],
                    spacing: { after: 200 },
                  })
              ),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore nell\'esportazione DOCX:', error);
      alert('Errore nell\'esportazione DOCX');
    } finally {
      setIsExporting(null);
    }
  };

  const exportToEPUB = async () => {
    setIsExporting('epub');
    try {
      // Crea un file HTML ben formattato che può essere convertito in EPUB
      const text = htmlToPlainText(content);
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      
      const htmlContent = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    body {
      font-family: Georgia, serif;
      padding: 2em;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 1em;
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 0.5em;
    }
    h2 {
      font-size: 1.8em;
      margin-top: 1.5em;
      margin-bottom: 0.8em;
    }
    h3 {
      font-size: 1.4em;
      margin-top: 1.2em;
      margin-bottom: 0.6em;
    }
    p {
      margin-bottom: 1em;
      text-align: justify;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${paragraphs.map(p => `<p>${p.trim().replace(/\n/g, ' ')}</p>`).join('\n  ')}
</body>
</html>`;

      // Esporta come HTML (può essere convertito in EPUB con Calibre o altri tool)
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Mostra un messaggio informativo
      setTimeout(() => {
        alert('File HTML esportato con successo!\n\nPer convertirlo in EPUB:\n1. Apri il file con Calibre\n2. Converti in formato EPUB\n\nOppure usa un convertitore online come:\n- https://convertio.co/html-epub/\n- https://www.zamzar.com/convert/html-to-epub/');
      }, 100);
    } catch (error) {
      console.error('Errore nell\'esportazione EPUB:', error);
      alert('Errore nell\'esportazione EPUB');
    } finally {
      setIsExporting(null);
    }
  };

  const shareProject = async () => {
    setIsSharing(true);
    try {
      if (!content || !content.trim()) {
        alert('Il progetto è vuoto. Aggiungi del contenuto prima di condividere.');
        setIsSharing(false);
        return;
      }

      // Converti il contenuto in formato capitolo per la condivisione
      const chapters = [{
        title: title || 'Documento',
        content: content,
        order: 1,
      }];

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Documento Condiviso',
          description: '',
          chapters: chapters,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nella condivisione');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
      
      // Copia il link negli appunti
      await navigator.clipboard.writeText(data.shareUrl);
      alert(`Link di condivisione creato e copiato negli appunti!\n\n${data.shareUrl}\n\nIl link sarà valido per 30 giorni.`);
    } catch (error) {
      console.error('Errore nella condivisione:', error);
      alert('Errore nella condivisione del progetto');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-md"
          style={{ backgroundColor: 'var(--accent)' }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          title="Esporta in PDF, DOCX o EPUB"
        >
          <Download size={18} />
          Esporta
        </button>

        {isMenuOpen && (
          <div 
            className="absolute left-0 mt-2 w-56 rounded-lg shadow-xl border z-50"
            style={{ 
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--border)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
                Formati Disponibili
              </p>
            </div>
            <button
              onClick={() => {
                exportToPDF();
                setIsMenuOpen(false);
              }}
              disabled={isExporting !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors disabled:opacity-50"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isExporting === 'pdf' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <FileText size={18} />
              )}
              <div className="flex-1">
                <div className="font-medium">PDF</div>
                <div className="text-xs" style={{ opacity: 0.6 }}>Documento</div>
              </div>
            </button>
            <button
              onClick={() => {
                exportToDOCX();
                setIsMenuOpen(false);
              }}
              disabled={isExporting !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors disabled:opacity-50"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isExporting === 'docx' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <File size={18} />
              )}
              <div className="flex-1">
                <div className="font-medium">DOCX</div>
                <div className="text-xs" style={{ opacity: 0.6 }}>Microsoft Word</div>
              </div>
            </button>
            <button
              onClick={() => {
                exportToEPUB();
                setIsMenuOpen(false);
              }}
              disabled={isExporting !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors last:rounded-b-lg disabled:opacity-50"
              style={{ color: 'var(--foreground)' }}
              onMouseEnter={(e) => {
                if (!isExporting) {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isExporting === 'epub' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <BookOpen size={18} />
              )}
              <div className="flex-1">
                <div className="font-medium">EPUB</div>
                <div className="text-xs" style={{ opacity: 0.6 }}>eBook</div>
              </div>
            </button>
          </div>
        )}
      </div>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md border"
        style={{
          backgroundColor: 'transparent',
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
        }}
        onClick={shareProject}
        disabled={isSharing}
        onMouseEnter={(e) => {
          if (!isSharing) {
            e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Crea un link pubblico per condividere questo progetto"
      >
        {isSharing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Share2 size={18} />
        )}
        {shareUrl ? 'Link Creato' : 'Condividi'}
      </button>
    </div>
  );
}

