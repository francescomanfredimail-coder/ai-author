import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, projectId, maxTokens } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY non configurato' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt richiesto' },
        { status: 400 }
      );
    }

    // Costruisci il prompt completo per l'agente autore
    const systemPrompt = `Sei un autore professionista esperto. Il tuo compito è creare contenuti testuali di alta qualità che siano:
- Coerenti e logici dall'inizio alla fine
- Con sintassi corretta e grammatica perfetta
- Scorrevoli e naturali da leggere
- Ben strutturati e organizzati con introduzione, sviluppo e conclusione
- Mantenendo uno stile narrativo professionale

REGOLE CRITICHE PER LA COMPLETEZZA:
1. SEMPRE termina con una frase completa e grammaticalmente corretta
2. SEMPRE termina con punteggiatura appropriata (punto, punto esclamativo, o punto interrogativo)
3. MAI interrompere a metà frase, a metà pensiero o con punteggiatura incompleta
4. SEMPRE includi una conclusione logica e soddisfacente che dia senso al testo
5. L'ultima frase deve completare il pensiero in modo naturale e coerente

Quando generi contenuti, ragiona come un vero autore: sviluppa trame, costruisci personaggi, organizza capitoli e mantieni coerenza narrativa. Assicurati sempre che il testo sia completo e termini in modo logico e soddisfacente.`;

    // Il contesto viene passato dal client che ha già recuperato la memoria
    const userPrompt = context
      ? `Contesto del progetto:\n${context}\n\nNuova richiesta: ${prompt}\n\nGenera contenuto che si integri naturalmente con il contesto esistente, mantenendo coerenza con quanto scritto in precedenza.`
      : prompt;

    // Usa maxTokens personalizzato se fornito, altrimenti default 2000
    const tokenLimit = maxTokens && typeof maxTokens === 'number' && maxTokens > 0 
      ? Math.min(maxTokens, 4000) // Limite massimo di sicurezza
      : 2000;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: tokenLimit,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    // Calcola il costo (approssimativo)
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    
    // Prezzi approssimativi per gpt-4o-mini (aggiorna con i prezzi reali)
    const inputCost = (inputTokens / 1000000) * 0.15; // $0.15 per 1M token input
    const outputCost = (outputTokens / 1000000) * 0.6; // $0.60 per 1M token output
    const totalCost = inputCost + outputCost;

    // Salva la conversazione nella memoria (solo lato client, qui registriamo per riferimento)
    // La memoria verrà aggiornata lato client dopo la risposta

    return NextResponse.json({
      content: generatedContent,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: completion.usage?.total_tokens || 0,
        cost: totalCost,
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Errore nella generazione:', error);
    
    let errorMessage = 'Errore durante la generazione del contenuto';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Messaggi di errore più chiari
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Chiave API non valida. Verifica la chiave in .env.local';
      } else if (error.message.includes('429')) {
        errorMessage = 'Limite di rate superato. Riprova più tardi';
      } else if (error.message.includes('insufficient_quota')) {
        errorMessage = 'Crediti insufficienti. Ricarica il tuo account OpenAI';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

