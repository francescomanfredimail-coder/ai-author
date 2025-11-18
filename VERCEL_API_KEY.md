# 🔑 Guida Aggiungere Chiave API OpenAI su Vercel

## Metodo 1: Dopo aver Importato il Repository

### Passo 1: Vai al Dashboard Vercel
1. Vai su **https://vercel.com**
2. Accedi con il tuo account (puoi usare GitHub)
3. Clicca su **Dashboard** o **Projects**

### Passo 2: Seleziona il Progetto
1. Se hai già importato il repository, clicca sul progetto **ai-author**
2. Se non l'hai ancora importato:
   - Clicca su **"Add New..."** → **"Project"**
   - Importa il repository `francescomanfredimail-coder/ai-author`
   - Clicca **Import**

### Passo 3: Vai alle Impostazioni
1. Una volta nel progetto, clicca sulla tab **Settings** (in alto)
2. Nella barra laterale sinistra, clicca su **Environment Variables**

### Passo 4: Aggiungi la Variabile
1. Vedrai una sezione "Environment Variables"
2. Compila il form:
   - **Name**: `OPENAI_API_KEY` (esatto, tutto maiuscolo)
   - **Value**: Incolla la tua chiave API OpenAI (inizia con `sk-...`)
   - **Environment**: Seleziona tutte e tre:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
3. Clicca **Save**

### Passo 5: Riavvia il Deploy
1. Vai su **Deployments** (tab in alto)
2. Clicca sui tre puntini (...) sul deploy più recente
3. Seleziona **Redeploy**
4. Oppure fai un nuovo push su GitHub per triggerare un nuovo deploy

## Metodo 2: Durante l'Import del Repository

### Passo 1: Importa il Repository
1. Vai su **https://vercel.com/new**
2. Clicca su **Import Git Repository**
3. Seleziona **GitHub** e autorizza se necessario
4. Cerca e seleziona `francescomanfredimail-coder/ai-author`
5. Clicca **Import**

### Passo 2: Configurazione del Progetto
1. Nella pagina di configurazione, vedrai:
   - **Project Name**: `ai-author` (lascia così)
   - **Framework Preset**: Next.js (dovrebbe essere già selezionato)
   - **Root Directory**: `./` (lascia così)

### Passo 3: Environment Variables (PRIMA di cliccare Deploy!)
1. **IMPORTANTE**: Prima di cliccare "Deploy", espandi la sezione **"Environment Variables"**
2. Clicca su **"Add"** o **"Add Environment Variable"**
3. Compila:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: La tua chiave API OpenAI
   - Seleziona tutti gli ambienti (Production, Preview, Development)
4. Clicca **Add** per aggiungere la variabile
5. **POI** clicca **Deploy**

## Metodo 3: Link Diretto alle Environment Variables

Se il progetto è già su Vercel, vai direttamente a:
**https://vercel.com/dashboard**

Poi:
1. Clicca sul progetto **ai-author**
2. Vai su **Settings** → **Environment Variables**

## Dove Trovare la Chiave API OpenAI

Se non hai ancora la chiave API OpenAI:

1. Vai su **https://platform.openai.com/api-keys**
2. Accedi con il tuo account OpenAI
3. Clicca su **"Create new secret key"**
4. Dai un nome (es. "Lama Bollente")
5. Clicca **"Create secret key"**
6. **COPIA SUBITO** la chiave (inizia con `sk-...`)
7. Salvala in un posto sicuro (non la vedrai più!)

## Verifica che Funzioni

Dopo aver aggiunto la variabile:

1. Vai su **Deployments**
2. Clicca sul deploy più recente
3. Vai su **Functions** → **Logs**
4. Prova a generare un articolo nel sito
5. Se vedi errori tipo "OPENAI_API_KEY non configurato", la variabile non è stata configurata correttamente

## Troubleshooting

### Non vedo "Environment Variables"
- Assicurati di essere nella sezione **Settings** del progetto
- Controlla di avere i permessi sul progetto
- Prova a ricaricare la pagina

### La variabile non funziona
- Verifica che il nome sia esattamente `OPENAI_API_KEY` (maiuscolo)
- Assicurati di aver selezionato tutti gli ambienti
- Riavvia il deploy dopo aver aggiunto la variabile
- Controlla i log per errori specifici

### Non trovo il progetto
- Vai su **https://vercel.com/dashboard**
- Cerca "ai-author" nella barra di ricerca
- Se non c'è, importa il repository da GitHub

## Screenshot della Posizione

La sezione Environment Variables si trova in:
```
Dashboard → [Nome Progetto] → Settings → Environment Variables
```

Nella barra laterale sinistra, sotto "Settings", vedrai:
- General
- Domains
- **Environment Variables** ← QUI!
- Git
- Deployments
- Analytics
- etc.

---

**Hai ancora problemi?** Controlla i log del deploy su Vercel per vedere errori specifici.

