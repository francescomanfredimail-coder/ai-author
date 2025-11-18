'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading1, Heading2, List, Quote } from 'lucide-react';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function TextEditor({ content, onChange, placeholder = 'Inizia a scrivere...' }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false, // Evita problemi di idratazione SSR
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
  });

  // Sincronizza il contenuto quando cambia esternamente
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div 
      className="rounded-lg shadow-md border"
      style={{ 
        backgroundColor: 'var(--paper)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Toolbar */}
      <div 
        className="flex items-center gap-2 p-3 border-b flex-wrap"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="p-2 rounded transition-colors"
          style={{
            backgroundColor: editor.isActive('bold') ? 'var(--accent)' : 'transparent',
            color: editor.isActive('bold') ? '#fff' : 'var(--foreground)',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('bold')) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('bold')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          title="Grassetto"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="p-2 rounded transition-colors"
          style={{
            backgroundColor: editor.isActive('italic') ? 'var(--accent)' : 'transparent',
            color: editor.isActive('italic') ? '#fff' : 'var(--foreground)',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('italic')) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('italic')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          title="Corsivo"
        >
          <Italic size={18} />
        </button>
        <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--border)' }} />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="p-2 rounded transition-colors"
          style={{
            backgroundColor: editor.isActive('heading', { level: 1 }) ? 'var(--accent)' : 'transparent',
            color: editor.isActive('heading', { level: 1 }) ? '#fff' : 'var(--foreground)',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('heading', { level: 1 })) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('heading', { level: 1 })) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          title="Titolo 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="p-2 rounded transition-colors"
          style={{
            backgroundColor: editor.isActive('heading', { level: 2 }) ? 'var(--accent)' : 'transparent',
            color: editor.isActive('heading', { level: 2 }) ? '#fff' : 'var(--foreground)',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('heading', { level: 2 })) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('heading', { level: 2 })) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          title="Titolo 2"
        >
          <Heading2 size={18} />
        </button>
        <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--border)' }} />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-2 rounded transition-colors"
          style={{
            backgroundColor: editor.isActive('bulletList') ? 'var(--accent)' : 'transparent',
            color: editor.isActive('bulletList') ? '#fff' : 'var(--foreground)',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('bulletList')) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('bulletList')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          title="Lista"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="p-2 rounded transition-colors"
          style={{
            backgroundColor: editor.isActive('blockquote') ? 'var(--accent)' : 'transparent',
            color: editor.isActive('blockquote') ? '#fff' : 'var(--foreground)',
          }}
          onMouseEnter={(e) => {
            if (!editor.isActive('blockquote')) {
              e.currentTarget.style.backgroundColor = 'rgba(139, 111, 71, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!editor.isActive('blockquote')) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          title="Citazione"
        >
          <Quote size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="min-h-[400px] p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

