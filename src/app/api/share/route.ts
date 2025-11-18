import { NextRequest, NextResponse } from 'next/server';

// In produzione, usa un database. Per ora usiamo una mappa in memoria
// In un'app reale, salveresti questo in un database
const sharedBooks = new Map<string, {
  id: string;
  title: string;
  description?: string;
  chapters: Array<{ title: string; content: string; order: number }>;
  createdAt: string;
  expiresAt?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, chapters } = body;

    if (!title || !chapters || !Array.isArray(chapters)) {
      return NextResponse.json(
        { error: 'Dati mancanti o non validi' },
        { status: 400 }
      );
    }

    // Genera un ID univoco
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Salva il libro condiviso (scade dopo 30 giorni)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    sharedBooks.set(shareId, {
      id: shareId,
      title,
      description,
      chapters: chapters.map((ch: any) => ({
        title: ch.title,
        content: ch.content,
        order: ch.order,
      })),
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    // Pulisci i libri scaduti
    const now = new Date();
    for (const [id, book] of sharedBooks.entries()) {
      if (book.expiresAt && new Date(book.expiresAt) < now) {
        sharedBooks.delete(id);
      }
    }

    return NextResponse.json({
      shareId,
      shareUrl: `${request.nextUrl.origin}/share/${shareId}`,
    });
  } catch (error) {
    console.error('Errore nella condivisione:', error);
    return NextResponse.json(
      { error: 'Errore nella condivisione del libro' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'ID condivisione mancante' },
        { status: 400 }
      );
    }

    const book = sharedBooks.get(shareId);

    if (!book) {
      return NextResponse.json(
        { error: 'Libro non trovato o scaduto' },
        { status: 404 }
      );
    }

    // Verifica se è scaduto
    if (book.expiresAt && new Date(book.expiresAt) < new Date()) {
      sharedBooks.delete(shareId);
      return NextResponse.json(
        { error: 'Link di condivisione scaduto' },
        { status: 410 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Errore nel recupero del libro:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del libro' },
      { status: 500 }
    );
  }
}

