# 🔧 Troubleshooting - Lama Bollente

## Problemi Comuni con il Deploy

### Il link del sito deployato non funziona

#### 1. Verifica che il deploy sia completato
- Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
- Controlla lo stato del deploy (deve essere "Ready" o "Success")
- Se c'è un errore, clicca sul deploy per vedere i log

#### 2. Verifica le variabili d'ambiente
- Vai su **Settings** → **Environment Variables**
- Assicurati che `OPENAI_API_KEY` sia configurata
- Verifica che sia disponibile per l'ambiente corretto (Production)

#### 3. Controlla i log di build
- Vai su **Deployments** → Clicca sul deploy più recente
- Controlla i **Build Logs** per errori
- Cerca errori comuni:
  - `OPENAI_API_KEY non configurato`
  - `Build failed`
  - Errori di compilazione TypeScript

#### 4. Riavvia il deploy
- Vai su **Deployments**
- Clicca sui tre puntini (...) sul deploy
- Seleziona **Redeploy**

### Errore: "OPENAI_API_KEY non configurato"

**Soluzione:**
1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: la tua chiave API OpenAI
   - Seleziona tutti gli ambienti (Production, Preview, Development)
5. Clicca **Save**
6. Riavvia il deploy

### Errore: "Build failed"

**Possibili cause e soluzioni:**

1. **Dipendenze mancanti:**
   ```bash
   # Verifica localmente
   npm install
   npm run build
   ```

2. **Errori TypeScript:**
   - Controlla i log di build su Vercel
   - Correggi gli errori TypeScript localmente
   - Pusha le correzioni

3. **Memoria insufficiente:**
   - Vercel ha limiti di memoria per il build
   - Controlla se il progetto è troppo grande
   - Considera di ottimizzare le dipendenze

### Il sito carica ma le funzionalità AI non funzionano

**Possibili cause:**
1. La variabile d'ambiente non è configurata correttamente
2. La chiave API OpenAI non è valida
3. La chiave API ha raggiunto il limite di utilizzo

**Soluzione:**
1. Verifica la chiave API su [platform.openai.com](https://platform.openai.com)
2. Controlla i log su Vercel (Functions → Logs)
3. Verifica che la variabile d'ambiente sia configurata per Production

### Il sito mostra "500 Internal Server Error"

**Soluzione:**
1. Controlla i log su Vercel:
   - Vai su **Functions** → **Logs**
   - Cerca errori recenti
2. Verifica le variabili d'ambiente
3. Controlla che la chiave API OpenAI sia valida
4. Riavvia il deploy

### Il sito non carica affatto (404 o dominio non trovato)

**Possibili cause:**
1. Il deploy non è stato completato
2. Stai usando l'URL sbagliato
3. Il progetto è stato eliminato

**Soluzione:**
1. Vai su [vercel.com/dashboard](https://vercel.com/dashboard)
2. Verifica che il progetto esista
3. Controlla l'URL corretto nella sezione **Domains**
4. Se necessario, crea un nuovo deploy

## Problemi Locali

### Il sito locale non funziona

#### 1. Verifica che il server sia avviato
```bash
npm run dev
```

#### 2. Verifica la porta
- Il sito dovrebbe essere su `http://localhost:3000`
- Se la porta è occupata, Next.js userà automaticamente un'altra porta

#### 3. Verifica le variabili d'ambiente
- Crea un file `.env.local` nella root del progetto
- Aggiungi: `OPENAI_API_KEY=your_key_here`

#### 4. Pulisci la cache
```bash
rm -rf .next
npm run dev
```

## Verifica Rapida

### Checklist Pre-Deploy
- [ ] Il progetto builda localmente (`npm run build`)
- [ ] Le variabili d'ambiente sono configurate
- [ ] La chiave API OpenAI è valida
- [ ] Non ci sono errori TypeScript
- [ ] Il codice è stato pushato su GitHub (se usi GitHub)

### Checklist Post-Deploy
- [ ] Il deploy è completato con successo
- [ ] Le variabili d'ambiente sono configurate su Vercel
- [ ] Il sito carica correttamente
- [ ] Le funzionalità AI funzionano
- [ ] Non ci sono errori nella console del browser

## Supporto Aggiuntivo

### Log Utili da Controllare
1. **Vercel Build Logs**: Mostrano errori durante il build
2. **Vercel Function Logs**: Mostrano errori delle API routes
3. **Browser Console**: Mostra errori lato client (F12 → Console)

### Comandi Utili

```bash
# Verifica che tutto funzioni localmente
npm install
npm run build
npm run dev

# Pulisci tutto e ricomincia
rm -rf .next node_modules
npm install
npm run dev
```

### Contatti
- Documentazione Vercel: [vercel.com/docs](https://vercel.com/docs)
- Documentazione Next.js: [nextjs.org/docs](https://nextjs.org/docs)

---

**Se il problema persiste**, controlla i log specifici e descrivi l'errore esatto che vedi.

