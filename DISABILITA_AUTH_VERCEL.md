# 🔓 Disabilitare Autenticazione Vercel per Link Pubblici

Se i link pubblici (`/share/[shareId]`) richiedono autenticazione Vercel invece di permettere l'accesso con i 3 account (alpha, beta, gamma), segui questi passaggi:

## ⚠️ Problema
Vercel potrebbe avere attiva una protezione a livello di progetto che blocca l'accesso prima che arrivi al codice dell'applicazione.

## ✅ Soluzione

### 1. Disabilita Password Protection su Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto **ai-author**
3. Vai su **Settings** → **Deployment Protection**
4. Se vedi **Password Protection** attivo:
   - Clicca su **Disable** o **Remove**
   - Conferma la rimozione

### 2. Disabilita Vercel Authentication (se presente)

1. Vai su **Settings** → **Security**
2. Se vedi **Vercel Authentication** o **Team Protection**:
   - Disattivalo per il progetto
   - Oppure aggiungi un'eccezione per le route `/share/*`

### 3. Verifica le Impostazioni di Deployment

1. Vai su **Settings** → **General**
2. Assicurati che non ci siano:
   - **Deployment Protection** attiva
   - **Password Protection** attiva
   - **Vercel Authentication** attiva

### 4. Verifica le Route Pubbliche

Il codice è già configurato per permettere l'accesso pubblico a:
- `/login` - Pagina di login
- `/share/[shareId]` - Link pubblici di condivisione
- `/api/share` - API per la condivisione

### 5. Test

Dopo aver disabilitato le protezioni:

1. Apri un link pubblico: `https://tuo-dominio.vercel.app/share/share_123456`
2. Dovresti vedere la pagina di login con i 3 account (alpha, beta, gamma)
3. Inserisci uno dei 3 account per accedere
4. Non dovrebbe più chiedere autenticazione Vercel

## 🔍 Verifica Rapida

Se dopo aver disabilitato le protezioni Vercel il problema persiste:

1. Controlla la console del browser (F12) per errori
2. Verifica i log di Vercel: **Deployments** → Seleziona deployment → **Functions** → Logs
3. Assicurati che il middleware non blocchi le route `/share/*`

## 📝 Note

- L'autenticazione interna (alpha, beta, gamma) è gestita dal codice e funziona correttamente
- Le route `/share/*` sono pubbliche e richiedono solo l'autenticazione interna
- Vercel non dovrebbe interferire con queste route se le protezioni sono disabilitate

