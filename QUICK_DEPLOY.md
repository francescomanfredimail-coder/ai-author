# 🚀 Deploy Rapido - Lama Bollente

## Deploy in 3 Minuti con Vercel CLI

### Passo 1: Installa Vercel CLI
```bash
npm i -g vercel
```

### Passo 2: Accedi
```bash
vercel login
```

### Passo 3: Deploya
```bash
vercel
```

Quando richiesto:
- ✅ Conferma il progetto
- ✅ Aggiungi variabile d'ambiente: `OPENAI_API_KEY` = (la tua chiave API)

### Passo 4: Deploy in Produzione
```bash
vercel --prod
```

### ✅ Fatto!

Otterrai un link tipo: `https://lama-bollente-xyz.vercel.app`

**Condividi questo link con chiunque!** 🎉

---

## Alternativa: Deploy via GitHub

1. Pusha il codice su GitHub
2. Vai su [vercel.com](https://vercel.com)
3. Clicca "New Project" → Importa repository
4. Aggiungi `OPENAI_API_KEY` in Settings → Environment Variables
5. Deploy!

---

Per istruzioni dettagliate, vedi [DEPLOY.md](./DEPLOY.md)

