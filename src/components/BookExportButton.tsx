'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, BookOpen, File, Loader2, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';

interface BookExportButtonProps {
  title: string;
  description?: string;
  chapters: Array<{ title: string; content: string; order: number }>;
}

export function BookExportButton({ title, description, chapters }: BookExportButtonProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Interfaccia per elementi formattati
  interface FormattedElement {
    type: 'h1' | 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'blockquote';
    text: string;
    children?: FormattedElement[];
    bold?: boolean;
    italic?: boolean;
  }

  // Converte HTML in struttura formattata mantenendo tutti i dettagli
  const parseHTMLContent = (html: string): FormattedElement[] => {
    if (!html || !html.trim()) {
      return [];
    }
    
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    
    const result: FormattedElement[] = [];
    
    const processNode = (node: Node, parentBold = false, parentItalic = false): { text: string; bold: boolean; italic: boolean } => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        return { text, bold: parentBold, italic: parentItalic };
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        const isBold = tagName === 'strong' || tagName === 'b' || parentBold;
        const isItalic = tagName === 'em' || tagName === 'i' || parentItalic;
        
        // Gestisci liste (ul, ol) con i loro elementi li
        if (tagName === 'ul' || tagName === 'ol') {
          const listItems: string[] = [];
          Array.from(node.childNodes).forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName.toLowerCase() === 'li') {
              const liText = Array.from(child.childNodes)
                .map(c => processNode(c, false, false))
                .map(c => {
                  let text = c.text;
                  if (c.bold) text = `**${text}**`;
                  if (c.italic) text = `*${text}*`;
                  return text;
                })
                .join('');
              if (liText.trim()) {
                listItems.push(`• ${liText.trim()}`);
              }
            }
          });
          if (listItems.length > 0) {
            result.push({
              type: tagName as 'ul' | 'ol',
              text: listItems.join('\n'),
            });
          }
          return { text: '', bold: false, italic: false };
        }
        
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'p' || tagName === 'blockquote') {
          const children = Array.from(node.childNodes)
            .map(child => processNode(child, false, false))
            .map(c => {
              let text = c.text;
              if (c.bold) text = `**${text}**`;
              if (c.italic) text = `*${text}*`;
              return text;
            })
            .join('');
          
          if (children.trim()) {
            result.push({
              type: tagName as 'h1' | 'h2' | 'h3' | 'p' | 'blockquote',
              text: children.trim(),
            });
          }
          return { text: '', bold: false, italic: false };
        }
        
        // Gestisci tag inline (strong, em, b, i, br)
        if (tagName === 'br') {
          return { text: '\n', bold: parentBold, italic: parentItalic };
        }
        
        const children = Array.from(node.childNodes)
          .map(child => processNode(child, isBold, isItalic))
          .map(c => c.text)
          .join('');
        
        return { text: children, bold: isBold, italic: isItalic };
      }
      
      return { text: '', bold: false, italic: false };
    };
    
    // Se non ci sono nodi figli o il contenuto è solo testo, trattalo come paragrafo
    if (tmp.childNodes.length === 0 || (tmp.childNodes.length === 1 && tmp.childNodes[0].nodeType === Node.TEXT_NODE)) {
      const textContent = tmp.textContent || tmp.innerText || '';
      if (textContent.trim()) {
        // Dividi per paragrafi (doppie newline)
        const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim());
        paragraphs.forEach(para => {
          result.push({
            type: 'p',
            text: para.trim(),
          });
        });
      }
    } else {
      Array.from(tmp.childNodes).forEach(node => {
        processNode(node);
      });
    }
    
    // Se ancora non abbiamo risultati ma c'è testo, aggiungilo come paragrafo
    if (result.length === 0) {
      const textContent = tmp.textContent || tmp.innerText || '';
      if (textContent.trim()) {
        result.push({
          type: 'p',
          text: textContent.trim(),
        });
      }
    }
    
    return result;
  };

  const exportToPDF = async () => {
    setIsExporting('pdf');
    try {
      // Verifica che ci siano capitoli con contenuto
      const validChapters = chapters.filter(ch => ch.content && ch.content.trim());
      if (validChapters.length === 0) {
        alert('Nessun capitolo con contenuto da esportare. Aggiungi del contenuto ai capitoli prima di esportare.');
        setIsExporting(null);
        return;
      }

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a5', // Formato libro
        orientation: 'portrait',
      });

      // Configurazione font professionali - Times per look libro
      pdf.setFont('times');
      
      // Pagina copertina
      pdf.setFontSize(28);
      pdf.setFont('times', 'bold');
      const titleLines = pdf.splitTextToSize(title, 120);
      let y = 80;
      titleLines.forEach((line: string) => {
        pdf.text(line, 105, y, { align: 'center' });
        y += 12;
      });

      if (description) {
        pdf.setFontSize(13);
        pdf.setFont('times', 'italic');
        pdf.text(description, 105, y + 10, { align: 'center', maxWidth: 120 });
      }

      // Nuova pagina per il contenuto
      pdf.addPage();

      // Stile per il contenuto
      const pageWidth = 148; // A5 width in mm
      const pageHeight = 210; // A5 height in mm
      const margin = 20;
      const bottomMargin = 25; // Margine inferiore per numerazione pagine
      const textWidth = pageWidth - (margin * 2);
      const maxY = pageHeight - bottomMargin; // Altezza massima prima di nuova pagina
      let currentY = margin;

      validChapters.sort((a, b) => a.order - b.order).forEach((chapter, chapterIndex) => {
        // Nuova pagina per ogni capitolo (tranne il primo)
        if (chapterIndex > 0) {
          pdf.addPage();
          currentY = margin;
        }

        // Numero e titolo capitolo - Gerarchia chiara
        pdf.setFontSize(12);
        pdf.setFont('times', 'normal');
        pdf.text(`Capitolo ${chapter.order}`, margin, currentY);
        currentY += 8;
        
        pdf.setFontSize(22); // Titolo capitolo più grande
        pdf.setFont('times', 'bold');
        const chapterTitleLines = pdf.splitTextToSize(chapter.title, textWidth);
        chapterTitleLines.forEach((line: string) => {
          if (currentY + 10 > maxY) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += 10;
        });

        currentY += 8; // Spazio dopo il titolo capitolo

        // Contenuto del capitolo
        const parsedContent = parseHTMLContent(chapter.content || '');
        
        // Se non ci sono elementi parsati ma c'è contenuto, aggiungi come paragrafo
        if (parsedContent.length === 0 && chapter.content && chapter.content.trim()) {
          // Fallback: tratta il contenuto come testo semplice
          const textContent = chapter.content.replace(/<[^>]*>/g, '').trim();
          if (textContent) {
            parsedContent.push({
              type: 'p',
              text: textContent,
            });
          }
        }
        
        parsedContent.forEach((item) => {
          // Rimuovi markdown markers per il rendering
          const cleanText = item.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
          const hasBold = item.text.includes('**');
          const hasItalic = item.text.includes('*') && !item.text.includes('**');

          // Imposta sempre il font PRIMA di ogni elemento per assicurarsi che venga applicato
          if (item.type === 'h1') {
            // H1 - Titolo principale sezione (16pt, Times Bold)
            if (currentY + 12 > maxY) {
              pdf.addPage();
              currentY = margin;
            }
            currentY += 8;
            pdf.setFont('times', 'bold');
            pdf.setFontSize(16);
            const lines = pdf.splitTextToSize(cleanText, textWidth);
            lines.forEach((line: string) => {
              if (currentY + 7 > maxY) {
                pdf.addPage();
                currentY = margin;
                pdf.setFont('times', 'bold');
                pdf.setFontSize(16);
              }
              pdf.text(line, margin, currentY);
              currentY += 7;
            });
            currentY += 4;
          } else if (item.type === 'h2') {
            // H2 - Sottotitolo sezione (14pt, Times Bold)
            if (currentY + 10 > maxY) {
              pdf.addPage();
              currentY = margin;
            }
            currentY += 6;
            pdf.setFont('times', 'bold');
            pdf.setFontSize(14);
            const lines = pdf.splitTextToSize(cleanText, textWidth);
            lines.forEach((line: string) => {
              if (currentY + 6 > maxY) {
                pdf.addPage();
                currentY = margin;
                pdf.setFont('times', 'bold');
                pdf.setFontSize(14);
              }
              pdf.text(line, margin, currentY);
              currentY += 6;
            });
            currentY += 3;
          } else if (item.type === 'h3') {
            // H3 - Sottotitolo minore (12pt, Times Bold)
            if (currentY + 8 > maxY) {
              pdf.addPage();
              currentY = margin;
            }
            currentY += 5;
            pdf.setFont('times', 'bold');
            pdf.setFontSize(12);
            const lines = pdf.splitTextToSize(cleanText, textWidth);
            lines.forEach((line: string) => {
              if (currentY + 6 > maxY) {
                pdf.addPage();
                currentY = margin;
                pdf.setFont('times', 'bold');
                pdf.setFontSize(12);
              }
              pdf.text(line, margin, currentY);
              currentY += 5.5;
            });
            currentY += 2;
          } else if (item.type === 'blockquote') {
            // Blockquote - Citazione (10pt, Times Italic)
            if (currentY + 6 > maxY) {
              pdf.addPage();
              currentY = margin;
            }
            currentY += 4;
            pdf.setFont('times', 'italic');
            pdf.setFontSize(10);
            const lines = pdf.splitTextToSize(cleanText, textWidth - 10);
            lines.forEach((line: string) => {
              if (currentY + 5 > maxY) {
                pdf.addPage();
                currentY = margin;
                pdf.setFont('times', 'italic');
                pdf.setFontSize(10);
              }
              pdf.text(line, margin + 5, currentY);
              currentY += 5;
            });
            currentY += 3;
          } else if (item.type === 'ul' || item.type === 'ol') {
            // Liste - Testo normale (11pt, Times Normal)
            pdf.setFont('times', 'normal');
            pdf.setFontSize(11);
            const listItems = cleanText.split('\n').filter(li => li.trim());
            listItems.forEach((itemText: string) => {
              if (currentY + 6 > maxY) {
                pdf.addPage();
                currentY = margin;
                pdf.setFont('times', 'normal');
                pdf.setFontSize(11);
              }
              const lines = pdf.splitTextToSize(itemText.trim(), textWidth - 5);
              lines.forEach((line: string) => {
                if (currentY + 6 > maxY) {
                  pdf.addPage();
                  currentY = margin;
                  pdf.setFont('times', 'normal');
                  pdf.setFontSize(11);
                }
                pdf.text(line, margin + 5, currentY);
                currentY += 5.5;
              });
            });
            currentY += 2;
          } else {
            // Paragrafo normale - Testo corpo (11pt, Times Normal/Bold/Italic)
            if (currentY + 6 > maxY) {
              pdf.addPage();
              currentY = margin;
            }
            // Imposta font in base alla formattazione
            if (hasBold) {
              pdf.setFont('times', 'bold');
            } else if (hasItalic) {
              pdf.setFont('times', 'italic');
            } else {
              pdf.setFont('times', 'normal');
            }
            pdf.setFontSize(11);
            const lines = pdf.splitTextToSize(cleanText, textWidth);
            lines.forEach((line: string) => {
              if (currentY + 6 > maxY) {
                pdf.addPage();
                currentY = margin;
                // Reimposta font dopo cambio pagina
                if (hasBold) {
                  pdf.setFont('times', 'bold');
                } else if (hasItalic) {
                  pdf.setFont('times', 'italic');
                } else {
                  pdf.setFont('times', 'normal');
                }
                pdf.setFontSize(11);
              }
              pdf.text(line, margin, currentY);
              currentY += 5.5;
            });
            currentY += 3; // Spazio tra paragrafi
          }
        });

        currentY += 10; // Spazio tra capitoli
      });

      // Aggiungi numerazione pagine
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (i > 1) { // Salta la copertina
          pdf.setFontSize(9);
          pdf.setFont('times', 'normal');
          pdf.text(`Pagina ${i - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      }

      // Salva il PDF con nome file sicuro
      const safeTitle = title
        .replace(/[^a-z0-9\s-]/gi, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 50)
        .trim();
      const fileName = `${safeTitle || 'libro'}.pdf`;
      
      // Salva il PDF - jsPDF.save() non accetta opzioni, usa direttamente
      pdf.save(fileName);
    } catch (error) {
      console.error('Errore nell\'esportazione PDF:', error);
      alert('Errore nell\'esportazione PDF. Controlla la console per i dettagli.');
    } finally {
      setIsExporting(null);
    }
  };

  const exportToDOCX = async () => {
    setIsExporting('docx');
    try {
      // Verifica che ci siano capitoli con contenuto
      const validChapters = chapters.filter(ch => ch.content && ch.content.trim());
      if (validChapters.length === 0) {
        alert('Nessun capitolo con contenuto da esportare. Aggiungi del contenuto ai capitoli prima di esportare.');
        setIsExporting(null);
        return;
      }

      const docChildren: Paragraph[] = [];

      // Copertina
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 48, // 24pt
              font: 'Georgia',
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 600, before: 2000 },
        })
      );

      if (description) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: description,
                size: 28, // 14pt
                italics: true,
                font: 'Georgia',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
          })
        );
      }

      // Interruzione di pagina
      docChildren.push(new Paragraph({ children: [new TextRun('')], pageBreakBefore: true }));

      // Capitoli
      validChapters.sort((a, b) => a.order - b.order).forEach((chapter, chapterIndex) => {
        // Numero capitolo
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Capitolo ${chapter.order}`,
                size: 24, // 12pt
                italics: true,
                font: 'Georgia',
              }),
            ],
            spacing: { before: chapterIndex === 0 ? 0 : 720, after: 100 },
            alignment: AlignmentType.LEFT,
          })
        );

        // Titolo capitolo - Grande e distinto
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: chapter.title,
                bold: true,
                size: 40, // 20pt - Titolo capitolo grande
                font: 'Georgia',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 480 },
            alignment: AlignmentType.LEFT,
          })
        );

        // Contenuto del capitolo
        const parsedContent = parseHTMLContent(chapter.content || '');
        
        // Se non ci sono elementi parsati ma c'è contenuto, aggiungi come paragrafo
        if (parsedContent.length === 0 && chapter.content && chapter.content.trim()) {
          // Fallback: tratta il contenuto come testo semplice
          const textContent = chapter.content.replace(/<[^>]*>/g, '').trim();
          if (textContent) {
            parsedContent.push({
              type: 'p',
              text: textContent,
            });
          }
        }
        
        parsedContent.forEach((item) => {
          const cleanText = item.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
          
          if (item.type === 'h1') {
            // H1 - Titolo principale (16pt, Georgia Bold)
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: cleanText,
                    bold: true,
                    size: 32, // 16pt
                    font: 'Georgia',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 360, after: 240 },
              })
            );
          } else if (item.type === 'h2') {
            // H2 - Sottotitolo (14pt, Georgia Bold)
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: cleanText,
                    bold: true,
                    size: 28, // 14pt
                    font: 'Georgia',
                  }),
                ],
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300, after: 200 },
              })
            );
          } else if (item.type === 'h3') {
            // H3 - Sottotitolo minore (12pt, Georgia Bold)
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: cleanText,
                    bold: true,
                    size: 24, // 12pt
                    font: 'Georgia',
                  }),
                ],
                spacing: { before: 240, after: 160 },
              })
            );
          } else if (item.type === 'blockquote') {
            // Blockquote - Citazione (10pt, Georgia Italic)
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: cleanText,
                    italics: true,
                    size: 20, // 10pt
                    font: 'Georgia',
                  }),
                ],
                spacing: { before: 180, after: 180 },
                indent: { left: 720 }, // 1cm indent
              })
            );
          } else if (item.type === 'ul' || item.type === 'ol') {
            // Liste - Testo normale (11pt, Georgia)
            const listItems = cleanText.split('\n');
            listItems.forEach((itemText: string) => {
              if (itemText.trim()) {
                docChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: itemText.trim(),
                        size: 22, // 11pt
                        font: 'Georgia',
                      }),
                    ],
                    spacing: { after: 120 },
                    bullet: { level: 0 },
                  })
                );
              }
            });
          } else if (item.type === 'p' && cleanText.trim()) {
            // Paragrafo normale - Testo corpo (11pt, Georgia)
            // Gestisci testo con formattazione inline
            const textRuns: TextRun[] = [];
            
            // Trova tutte le occorrenze di bold e italic
            const markers: Array<{ pos: number; type: 'bold' | 'italic'; length: number }> = [];
            const boldMatches = [...item.text.matchAll(/\*\*(.*?)\*\*/g)];
            boldMatches.forEach(match => {
              if (match.index !== undefined) {
                markers.push({ pos: match.index, type: 'bold', length: match[0].length });
              }
            });
            const italicMatches = [...item.text.matchAll(/\*(.*?)\*/g)];
            italicMatches.forEach(match => {
              if (match.index !== undefined && !item.text.substring(match.index).startsWith('**')) {
                markers.push({ pos: match.index, type: 'italic', length: match[0].length });
              }
            });
            
            markers.sort((a, b) => a.pos - b.pos);
            
            if (markers.length === 0) {
              // Nessuna formattazione
              textRuns.push(new TextRun({ text: cleanText.trim(), size: 22, font: 'Georgia' }));
            } else {
              // Costruisci TextRun con formattazione
              let lastPos = 0;
              markers.forEach(marker => {
                if (marker.pos > lastPos) {
                  const beforeText = item.text.substring(lastPos, marker.pos).replace(/\*\*/g, '').replace(/\*/g, '');
                  if (beforeText.trim()) {
                    textRuns.push(new TextRun({ text: beforeText, size: 22, font: 'Georgia' }));
                  }
                }
                const matchText = item.text.substring(marker.pos, marker.pos + marker.length);
                const cleanMatch = matchText.replace(/\*\*/g, '').replace(/\*/g, '');
                if (marker.type === 'bold') {
                  textRuns.push(new TextRun({ text: cleanMatch, bold: true, size: 22, font: 'Georgia' }));
                } else {
                  textRuns.push(new TextRun({ text: cleanMatch, italics: true, size: 22, font: 'Georgia' }));
                }
                lastPos = marker.pos + marker.length;
              });
              const afterText = item.text.substring(lastPos).replace(/\*\*/g, '').replace(/\*/g, '');
              if (afterText.trim()) {
                textRuns.push(new TextRun({ text: afterText, size: 22, font: 'Georgia' }));
              }
            }
            
            docChildren.push(
              new Paragraph({
                children: textRuns.length > 0 ? textRuns : [new TextRun({ text: cleanText.trim(), size: 22, font: 'Georgia' })],
                spacing: { after: 240 },
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 720 }, // Indentazione prima riga
              })
            );
          }
        });

        // Spazio tra capitoli
        if (chapterIndex < validChapters.length - 1) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun('')],
              spacing: { after: 400 },
              pageBreakBefore: true,
            })
          );
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  width: 11906, // A5 width in twips (148mm)
                  height: 16838, // A5 height in twips (210mm)
                },
                margin: {
                  top: 1440, // 2.5cm
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
              },
            },
            children: docChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.docx`;
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
      // Verifica che ci siano capitoli con contenuto
      const validChapters = chapters.filter(ch => ch.content && ch.content.trim());
      if (validChapters.length === 0) {
        alert('Nessun capitolo con contenuto da esportare. Aggiungi del contenuto ai capitoli prima di esportare.');
        setIsExporting(null);
        return;
      }

      const chaptersHTML = validChapters
        .sort((a, b) => a.order - b.order)
        .map((chapter, index) => {
          const parsedContent = parseHTMLContent(chapter.content || '');
          
          // Se non ci sono elementi parsati ma c'è contenuto, aggiungi come paragrafo
          if (parsedContent.length === 0 && chapter.content && chapter.content.trim()) {
            // Fallback: tratta il contenuto come testo semplice
            const textContent = chapter.content.replace(/<[^>]*>/g, '').trim();
            if (textContent) {
              parsedContent.push({
                type: 'p',
                text: textContent,
              });
            }
          }
          
          const contentHTML = parsedContent
            .map((item) => {
              // Converti markdown in HTML
              let htmlText = item.text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
              
              if (item.type === 'h1') {
                return `<h1>${htmlText}</h1>`;
              } else if (item.type === 'h2') {
                return `<h2>${htmlText}</h2>`;
              } else if (item.type === 'h3') {
                return `<h3>${htmlText}</h3>`;
              } else if (item.type === 'p') {
                return `<p>${htmlText.trim()}</p>`;
              } else if (item.type === 'blockquote') {
                return `<blockquote>${htmlText.trim()}</blockquote>`;
              } else if (item.type === 'ul' || item.type === 'ol') {
                const listItems = item.text.split('\n').filter(li => li.trim());
                const listTag = item.type === 'ul' ? 'ul' : 'ol';
                return `<${listTag}>${listItems.map(li => `<li>${li.replace(/^•\s*/, '').trim()}</li>`).join('')}</${listTag}>`;
              }
              return '';
            })
            .join('\n');

          return `
            <div class="chapter">
              <h1 class="chapter-title">Capitolo ${index + 1}</h1>
              <h2 class="chapter-heading">${chapter.title}</h2>
              ${contentHTML}
            </div>
          `;
        })
        .join('\n');

      const htmlContent = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    @page {
      margin: 2cm 1.5cm;
    }
    
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 1.1em;
      line-height: 1.8;
      color: #2c2416;
      max-width: 800px;
      margin: 0 auto;
      padding: 2em 1em;
      text-align: justify;
    }
    
    .book-title {
      font-size: 2.5em;
      font-weight: bold;
      text-align: center;
      margin: 3em 0 2em 0;
      padding-bottom: 1em;
      border-bottom: 3px solid #8b6f47;
      color: #8b6f47;
    }
    
    .book-description {
      font-size: 1.2em;
      font-style: italic;
      text-align: center;
      margin: 2em 0 4em 0;
      color: #666;
      padding: 0 2em;
    }
    
    .chapter {
      page-break-before: always;
      margin-top: 3em;
    }
    
    .chapter-title {
      font-size: 0.9em;
      font-weight: normal;
      font-style: italic;
      text-align: left;
      margin: 3em 0 0.3em 0;
      color: #8b6f47;
      text-transform: none;
      letter-spacing: 0.05em;
      font-family: 'Georgia', serif;
    }
    
    .chapter-heading {
      font-size: 2.2em; /* Titolo capitolo grande */
      font-weight: bold;
      text-align: left;
      margin: 0 0 1.5em 0;
      color: #2c2416;
      padding-bottom: 0.3em;
      border-bottom: 2px solid #d4c4a8;
      font-family: 'Georgia', serif;
      line-height: 1.2;
    }
    
    h1 {
      font-size: 1.6em; /* H1 - Titolo principale sezione */
      font-weight: bold;
      margin: 2em 0 1em 0;
      color: #8b6f47;
      page-break-after: avoid;
      line-height: 1.3;
      font-family: 'Georgia', serif;
    }
    
    h2 {
      font-size: 1.4em; /* H2 - Sottotitolo sezione */
      font-weight: bold;
      margin: 1.8em 0 0.9em 0;
      color: #8b6f47;
      page-break-after: avoid;
      line-height: 1.4;
      font-family: 'Georgia', serif;
    }
    
    h3 {
      font-size: 1.2em; /* H3 - Sottotitolo minore */
      font-weight: bold;
      margin: 1.5em 0 0.7em 0;
      color: #6b5d3f;
      page-break-after: avoid;
      line-height: 1.5;
      font-family: 'Georgia', serif;
    }
    
    blockquote {
      border-left: 4px solid #8b6f47;
      padding-left: 1.5em;
      margin: 1.5em 0;
      font-style: italic;
      color: #6b5d3f;
      background: rgba(139, 111, 71, 0.05);
      padding: 1em 1.5em;
      border-radius: 4px;
    }
    
    ul, ol {
      margin: 1.5em 0;
      padding-left: 2em;
      font-family: 'Georgia', serif;
    }
    
    li {
      margin: 0.5em 0;
      line-height: 1.8;
      font-size: 1.1em; /* Testo lista - 11pt */
      font-family: 'Georgia', serif;
    }
    
    p {
      margin: 1em 0;
      text-indent: 1.5em;
      text-align: justify;
      orphans: 3;
      widows: 3;
      font-size: 1.1em; /* Testo corpo - 11pt equivalente */
      font-family: 'Georgia', serif;
    }
    
    p:first-of-type {
      text-indent: 0;
    }
    
    strong {
      font-weight: bold;
      color: #2c2416;
      font-family: 'Georgia', serif;
    }
    
    em {
      font-style: italic;
      font-family: 'Georgia', serif;
    }
    
    /* Stile per la stampa */
    @media print {
      body {
        font-size: 12pt;
        line-height: 1.6;
      }
      
      .chapter {
        page-break-before: always;
      }
      
      h1, h2, h3 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="book-title">${title}</div>
  ${description ? `<div class="book-description">${description}</div>` : ''}
  ${chaptersHTML}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setTimeout(() => {
        alert('File HTML esportato con successo!\n\nIl file è già formattato professionalmente come un libro.\n\nPer convertirlo in EPUB:\n1. Apri il file con Calibre\n2. Converti in formato EPUB\n\nOppure usa un convertitore online come:\n- https://convertio.co/html-epub/\n- https://www.zamzar.com/convert/html-to-epub/');
      }, 100);
    } catch (error) {
      console.error('Errore nell\'esportazione EPUB:', error);
      alert('Errore nell\'esportazione EPUB');
    } finally {
      setIsExporting(null);
    }
  };

  const shareBook = async () => {
    setIsSharing(true);
    try {
      const validChapters = chapters.filter(ch => ch.content && ch.content.trim());
      if (validChapters.length === 0) {
        alert('Nessun capitolo con contenuto da condividere.');
        setIsSharing(false);
        return;
      }

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          chapters: validChapters,
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
      alert('Errore nella condivisione del libro');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <div className="relative" ref={menuRef}>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-md"
            style={{ backgroundColor: 'var(--accent)' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            title="Esporta il libro in PDF, DOCX o EPUB"
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
                title="Esporta come PDF (formato libro A5)"
              >
                {isExporting === 'pdf' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileText size={18} />
                )}
                <div className="flex-1">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs" style={{ opacity: 0.6 }}>Formato libro</div>
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
                title="Esporta come DOCX (Word)"
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
                title="Esporta come EPUB (eBook)"
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
          onClick={shareBook}
          disabled={isSharing}
          onMouseEnter={(e) => {
            if (!isSharing) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {isSharing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Share2 size={18} />
          )}
          {shareUrl ? 'Link Creato' : 'Condividi'}
        </button>
      </div>
    </div>
  );
}

