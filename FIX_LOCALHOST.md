# 🔧 Risoluzione Problemi Localhost - Lama Bollente

## Server Riavviato ✅

Ho già:
- ✅ Fermato i processi vecchi
- ✅ Rimosso la cache `.next`
- ✅ Riavviato il server

Il server dovrebbe essere disponibile su: **http://localhost:3000**

## Problemi Comuni e Soluzioni

### 1. La Pagina è Bianca o Non Carica

**Soluzione:**
1. Apri il browser in **modalità incognito** (Cmd+Shift+N su Mac)
2. Vai su `http://localhost:3000`
3. Se funziona, il problema è la cache del browser

**Pulisci la cache:**
- **Chrome/Edge**: Cmd+Shift+Delete → Seleziona "Cached images and files" → Clear
- **Safari**: Cmd+Option+E (svuota cache)
- **Firefox**: Cmd+Shift+Delete → Cache → Clear Now

### 2. Errore "Cannot find module" o "Chunk error"

**Soluzione:**
```bash
# Ferma il server (Ctrl+C)
# Poi esegui:
rm -rf .next
npm run dev
```

### 3. La Pagina Carica ma è "Raw" o Senza Stile

**Causa**: Problema di idratazione React o cache

**Soluzione:**
1. Apri la **Console del Browser** (F12 o Cmd+Option+I)
2. Controlla errori in rosso
3. Pulisci la cache (vedi sopra)
4. Ricarica la pagina con **Cmd+Shift+R** (hard refresh)

### 4. Errore "OPENAI_API_KEY non configurato"

**Soluzione:**
1. Verifica che il file `.env.local` esista nella root del progetto
2. Controlla che contenga:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Riavvia il server dopo aver modificato `.env.local`

### 5. Porta 3000 Occupata

**Soluzione:**
```bash
# Trova e termina il processo
lsof -ti:3000 | xargs kill -9

# Oppure usa un'altra porta
npm run dev -- -p 3001
```

Poi vai su `http://localhost:3001`

### 6. Errori nella Console del Browser

**Come vedere gli errori:**
1. Apri **Developer Tools** (F12 o Cmd+Option+I)
2. Vai su **Console**
3. Cerca errori in rosso
4. Copia l'errore e cercalo su Google o chiedi aiuto

## Verifica Rapida

### Controlla che il Server Sia Attivo

Apri il terminale e verifica:
```bash
curl http://localhost:3000
```

Se risponde con HTML, il server funziona.

### Controlla i Log del Server

Nel terminale dove hai eseguito `npm run dev`, dovresti vedere:
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in X seconds
```

Se vedi errori, copiali e cercali.

## Passi di Troubleshooting Completo

Se nulla funziona, esegui questi comandi in ordine:

```bash
# 1. Ferma tutto
pkill -f "next dev"

# 2. Pulisci tutto
rm -rf .next
rm -rf node_modules/.cache

# 3. Reinstalla (se necessario)
npm install

# 4. Riavvia
npm run dev
```

Poi:
1. Apri browser in **modalità incognito**
2. Vai su `http://localhost:3000`
3. Apri **Console** (F12) e controlla errori

## Problemi Specifici

### "Hydration Error"
- Causa: Differenza tra server e client rendering
- Soluzione: Hard refresh (Cmd+Shift+R)

### "Module not found"
- Causa: Cache corrotta
- Soluzione: `rm -rf .next && npm run dev`

### Pagina lenta o che si blocca
- Causa: Loop infiniti o re-render eccessivi
- Soluzione: Controlla la console per warning

## Se Nulla Funziona

1. **Copia l'errore esatto** dalla console del browser
2. **Copia i log** dal terminale del server
3. Verifica che:
   - Node.js sia installato: `node --version`
   - npm sia installato: `npm --version`
   - Le dipendenze siano installate: `ls node_modules`

## Link Utili

- **Documentazione Next.js**: https://nextjs.org/docs
- **Stack Overflow**: Cerca l'errore specifico
- **GitHub Issues**: Cerca problemi simili nel repository

---

**Il server è attivo?** Prova ad aprire `http://localhost:3000` in modalità incognito!

