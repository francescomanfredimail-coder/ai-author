import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY non configurato' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Contenuto richiesto' },
        { status: 400 }
      );
    }

    const systemPrompt = `Sei un esperto analista di testi. Analizza il testo fornito e valuta:
1. Coerenza logica e narrativa (0-100)
2. Correttezza sintattica (0-100)
3. Scorrevolezza e leggibilità (0-100)
4. Suggerimenti specifici per migliorare il testo

Rispondi SOLO con un JSON valido nel seguente formato:
{
  "coherence": numero,
  "syntax": numero,
  "readability": numero,
  "suggestions": ["suggerimento1", "suggerimento2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analizza questo testo:\n\n${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const metrics = JSON.parse(responseText);

    // Calcola il costo
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const inputCost = (inputTokens / 1000000) * 0.15;
    const outputCost = (outputTokens / 1000000) * 0.6;
    const totalCost = inputCost + outputCost;

    return NextResponse.json({
      ...metrics,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: completion.usage?.total_tokens || 0,
        cost: totalCost,
      },
    });
  } catch (error) {
    console.error('Errore nell\'analisi:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Errore durante l\'analisi del contenuto',
      },
      { status: 500 }
    );
  }
}

