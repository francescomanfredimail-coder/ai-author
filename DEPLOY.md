# Guida al Deploy Pubblico - Lama Bollente 🦙

Questa guida ti aiuterà a rendere il tuo sito accessibile pubblicamente tramite un link condivisibile.

## Opzione 1: Vercel (Raccomandato per Next.js)

Vercel è la piattaforma ideale per deployare applicazioni Next.js. Offre:
- ✅ Deploy gratuito
- ✅ HTTPS automatico
- ✅ URL pubblico immediato
- ✅ Deploy automatico da GitHub
- ✅ Variabili d'ambiente sicure

### Metodo A: Deploy tramite Vercel CLI

1. **Installa Vercel CLI**:
```bash
npm i -g vercel
```

2. **Accedi a Vercel**:
```bash
vercel login
```

3. **Deploya il progetto** (dalla root del progetto):
```bash
vercel
```

4. **Segui le istruzioni**:
   - Conferma il progetto
   - Aggiungi la variabile d'ambiente quando richiesto:
     - Nome: `OPENAI_API_KEY`
     - Valore: la tua chiave API OpenAI

5. **Deploy in produzione**:
```bash
vercel --prod
```

### Metodo B: Deploy tramite GitHub + Vercel Dashboard

1. **Crea un repository GitHub**:
   - Vai su [github.com](https://github.com)
   - Crea un nuovo repository
   - Pusha il codice:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tuo-username/lama-bollente.git
   git push -u origin main
   ```

2. **Connetti a Vercel**:
   - Vai su [vercel.com](https://vercel.com)
   - Accedi con GitHub
   - Clicca su **"Add New..."** → **"Project"**
   - Importa il repository `lama-bollente`

3. **Configura le variabili d'ambiente**:
   - Nelle impostazioni del progetto, vai su **Settings** → **Environment Variables**
   - Aggiungi:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: la tua chiave API OpenAI
     - Seleziona tutti gli ambienti (Production, Preview, Development)
   - Clicca **Save**

4. **Deploy**:
   - Clicca **Deploy**
   - Vercel builda e deploya automaticamente il progetto

### Ottenere il Link Pubblico

Dopo il deploy, otterrai:
- **URL Preview**: `https://lama-bollente-xyz123.vercel.app`
- **URL Produzione**: `https://lama-bollente.vercel.app` (se configurato)

Puoi condividere questo link con chiunque!

## Opzione 2: Netlify

1. **Installa Netlify CLI**:
```bash
npm i -g netlify-cli
```

2. **Build del progetto**:
```bash
npm run build
```

3. **Deploy**:
```bash
netlify deploy --prod
```

4. **Configura variabili d'ambiente**:
   - Vai su [app.netlify.com](https://app.netlify.com)
   - Settings → Environment variables
   - Aggiungi `OPENAI_API_KEY`

## Opzione 3: Railway

1. Vai su [railway.app](https://railway.app)
2. Crea un nuovo progetto
3. Connetti il repository GitHub
4. Aggiungi la variabile d'ambiente `OPENAI_API_KEY`
5. Railway deploya automaticamente

## Opzione 4: Render

1. Vai su [render.com](https://render.com)
2. Crea un nuovo Web Service
3. Connetti il repository GitHub
4. Configura:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Aggiungi la variabile d'ambiente `OPENAI_API_KEY`

## Test Locale Pubblico (ngrok)

Per testare localmente con un link pubblico temporaneo:

1. **Installa ngrok**:
```bash
npm i -g ngrok
```

2. **Avvia il server locale**:
```bash
npm run dev
```

3. **In un altro terminale, avvia ngrok**:
```bash
ngrok http 3000
```

4. **Copia l'URL HTTPS** fornito da ngrok (es: `https://abc123.ngrok.io`)

⚠️ **Nota**: L'URL ngrok è temporaneo e cambia ad ogni avvio (a meno che non usi un account a pagamento).

## Configurazione Post-Deploy

### Variabili d'Ambiente Necessarie

Assicurati di configurare queste variabili d'ambiente sulla piattaforma di deploy:

- `OPENAI_API_KEY`: La tua chiave API OpenAI (obbligatoria)

### Verifica del Deploy

Dopo il deploy, verifica che:
1. ✅ Il sito carichi correttamente
2. ✅ La generazione AI funzioni (testa creando un articolo)
3. ✅ Le variabili d'ambiente siano configurate correttamente

## Domini Personalizzati

### Vercel

1. Vai su **Settings** → **Domains**
2. Aggiungi il tuo dominio
3. Segui le istruzioni per configurare i DNS

### Netlify

1. Vai su **Domain settings**
2. Aggiungi un dominio personalizzato
3. Configura i DNS come indicato

## Troubleshooting

### Errore: "OPENAI_API_KEY non configurato"

- Verifica che la variabile d'ambiente sia configurata sulla piattaforma
- Assicurati che sia disponibile per l'ambiente corretto (Production/Preview)
- Riavvia il deploy dopo aver aggiunto la variabile

### Errore: "Build failed"

- Controlla i log di build sulla piattaforma
- Verifica che tutte le dipendenze siano installate correttamente
- Assicurati che `npm run build` funzioni localmente

### Il sito non carica

- Verifica che il deploy sia completato con successo
- Controlla i log per errori
- Assicurati che la porta sia configurata correttamente

## Supporto

Per problemi o domande:
- Controlla i log sulla piattaforma di deploy
- Verifica la documentazione della piattaforma scelta
- Controlla che tutte le variabili d'ambiente siano configurate

---

**Buon deploy! 🚀**

