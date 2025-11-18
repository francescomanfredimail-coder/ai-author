# Lama Bollente 🦙

Interfaccia web avanzata per creare libri e contenuti testuali tramite un agente AI sofisticato collegato a OpenAI.

## Caratteristiche

- ✍️ **Editor Testuale Avanzato** - Editor ricco con formattazione (grassetto, corsivo, titoli, liste)
- 🤖 **Generazione AI** - Crea contenuti di alta qualità con OpenAI GPT
- 📊 **Controllo Qualità** - Analisi automatica di coerenza, sintassi e leggibilità
- 📝 **Prompt Guidati** - Template predefiniti per capitoli, dialoghi, descrizioni
- 💾 **Gestione Progetti** - Salva e organizza i tuoi progetti di scrittura
- 💰 **Monitoraggio Crediti** - Traccia l'utilizzo dei crediti OpenAI in tempo reale
- 📈 **Dashboard** - Panoramica completa di progetti e statistiche

## Installazione

1. Clona il repository o scarica il progetto
2. Installa le dipendenze:

```bash
npm install
```

3. Configura le variabili d'ambiente:

```bash
cp .env.example .env
```

Aggiungi la tua chiave API OpenAI nel file `.env`:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Avvia il server di sviluppo:

```bash
npm run dev
```

5. Apri [http://localhost:3000](http://localhost:3000) nel browser

## Utilizzo

### Creare un Nuovo Progetto

1. Vai alla pagina **Editor** dalla sidebar
2. Un nuovo progetto verrà creato automaticamente
3. Inserisci un titolo per il progetto

### Generare Contenuto con AI

1. Nella sezione "Prompt per l'AI", inserisci la tua richiesta
2. Clicca su **Genera** o premi Enter
3. Il contenuto generato verrà aggiunto all'editor

### Usare Prompt Guidati

1. Vai alla pagina **Prompt Guidati**
2. Seleziona un template (Capitolo, Dialogo, Descrizione, Trama)
3. Personalizza tono, stile, target e lunghezza
4. Clicca su **Usa questo Prompt** per applicarlo all'editor

### Controllo Qualità

1. Nell'editor, dopo aver scritto del contenuto
2. Scorri fino alla sezione **Controllo Qualità**
3. Clicca su **Analizza** per ottenere:
   - Punteggio di coerenza
   - Punteggio di sintassi
   - Punteggio di leggibilità
   - Suggerimenti per migliorare

### Gestire i Progetti

- Vai alla pagina **Progetti** per vedere tutti i tuoi progetti
- Clicca su un progetto per aprirlo nell'editor
- Elimina progetti che non ti servono più

### Monitorare i Crediti

- La **Dashboard** mostra:
  - Crediti totali utilizzati
  - Crediti utilizzati oggi
  - Statistiche dei progetti

## Tecnologie Utilizzate

- **Next.js 15** - Framework React
- **TypeScript** - Tipizzazione statica
- **Tailwind CSS** - Styling
- **TipTap** - Editor di testo ricco
- **OpenAI API** - Generazione contenuti AI
- **Zustand** - State management
- **Lucide React** - Icone

## Struttura del Progetto

```
src/
├── app/
│   ├── api/
│   │   ├── generate/          # API per generazione contenuti
│   │   └── quality-check/     # API per controllo qualità
│   ├── editor/                # Pagina editor
│   ├── prompts/               # Pagina prompt guidati
│   ├── projects/              # Pagina gestione progetti
│   └── page.tsx               # Dashboard
├── components/
│   ├── Layout.tsx             # Layout principale con sidebar
│   ├── Sidebar.tsx            # Barra laterale di navigazione
│   ├── TextEditor.tsx         # Editor di testo ricco
│   └── QualityCheck.tsx       # Componente controllo qualità
└── lib/
    └── store.ts               # Store Zustand per state management
```

## Deploy Pubblico (Vercel)

Per rendere il sito accessibile pubblicamente tramite un link, puoi deployare su Vercel:

### Opzione 1: Deploy tramite Vercel CLI (Raccomandato)

1. Installa Vercel CLI:
```bash
npm i -g vercel
```

2. Accedi a Vercel:
```bash
vercel login
```

3. Deploya il progetto:
```bash
vercel
```

4. Segui le istruzioni e quando richiesto, aggiungi la variabile d'ambiente:
   - Nome: `OPENAI_API_KEY`
   - Valore: la tua chiave API OpenAI

5. Per il deploy in produzione:
```bash
vercel --prod
```

### Opzione 2: Deploy tramite GitHub + Vercel

1. Crea un repository GitHub e pusha il codice
2. Vai su [vercel.com](https://vercel.com) e accedi con GitHub
3. Clicca su "New Project"
4. Importa il repository
5. Aggiungi la variabile d'ambiente `OPENAI_API_KEY` nelle impostazioni del progetto
6. Clicca "Deploy"

Il sito sarà disponibile su un URL tipo: `https://lama-bollente.vercel.app`

### Configurazione Variabili d'Ambiente su Vercel

1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: la tua chiave API OpenAI
   - Seleziona gli ambienti (Production, Preview, Development)
5. Clicca **Save**

### Link Pubblico

Dopo il deploy, otterrai un link pubblico tipo:
- `https://lama-bollente-xyz.vercel.app` (preview)
- `https://lama-bollente.vercel.app` (produzione, se configurato un dominio)

Puoi condividere questo link con chiunque per far provare il sito!

### Verifica Pre-Deploy

Prima di deployare, verifica che tutto sia configurato correttamente:

```bash
# Verifica la configurazione
node check-deploy.js

# Testa il build localmente
npm run build

# Se il build funziona, puoi deployare
vercel --prod
```

### Problemi con il Link?

Se il link del sito deployato non funziona:
1. Controlla i log su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Verifica che `OPENAI_API_KEY` sia configurata in Settings → Environment Variables
3. Controlla che il deploy sia completato con successo
4. Vedi [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) per soluzioni dettagliate

## Note Importanti

- I progetti vengono salvati nel localStorage del browser
- I crediti OpenAI vengono calcolati approssimativamente basandosi sui token utilizzati
- Assicurati di avere una chiave API OpenAI valida per utilizzare le funzionalità AI
- I dati vengono persi se si cancella il localStorage del browser
- **Per il deploy pubblico**: Assicurati di configurare la variabile d'ambiente `OPENAI_API_KEY` su Vercel

## Sviluppo Futuro

- [ ] Esportazione in PDF, DOCX, EPUB
- [ ] Salvataggio su cloud
- [ ] Collaborazione in tempo reale
- [ ] Versioning avanzato dei progetti
- [ ] Integrazione con altri modelli AI

## Licenza

MIT
# Updated Tue Nov 18 16:12:26 CET 2025
