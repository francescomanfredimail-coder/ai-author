# 📦 Guida Creazione Repository GitHub - Lama Bollente

## Dati per Creare il Repository

### Informazioni Base
- **Nome Repository**: `lama-bollente` (o `ai-author`, `lama-bollente-app`)
- **Descrizione**: `Lama Bollente - Piattaforma AI per creare libri e articoli con intelligenza artificiale`
- **Visibilità**: 
  - ✅ **Public** (consigliato se vuoi condividerlo)
  - 🔒 **Private** (se vuoi tenerlo privato)

### Impostazioni da NON selezionare
⚠️ **IMPORTANTE**: Quando crei il repository, NON selezionare:
- ❌ Add a README file
- ❌ Add .gitignore
- ❌ Choose a license

Il progetto ha già questi file, quindi non servono.

## Passo 1: Crea il Repository

1. Vai su: **https://github.com/new**
2. Compila il form:
   - **Repository name**: `lama-bollente`
   - **Description**: `Lama Bollente - Piattaforma AI per creare libri e articoli con intelligenza artificiale`
   - **Visibility**: Scegli Public o Private
   - **NON selezionare** README, .gitignore o license
3. Clicca **"Create repository"**

## Passo 2: Collega il Repository Locale

Dopo aver creato il repository, GitHub ti mostrerà una pagina con i comandi. 

**Oppure esegui questi comandi** (sostituisci `TUO_USERNAME` con il tuo username GitHub):

```bash
# Aggiungi il remote
git remote add origin https://github.com/TUO_USERNAME/lama-bollente.git

# Verifica che sia stato aggiunto
git remote -v

# Fai push del codice
git branch -M main
git push -u origin main
```

## Passo 3: Verifica

Dopo il push, vai su:
`https://github.com/TUO_USERNAME/lama-bollente`

Dovresti vedere tutti i file del progetto!

## Dati Tecnici del Progetto

- **Linguaggio**: TypeScript
- **Framework**: Next.js 15.5.6
- **Package Manager**: npm
- **Node Version**: Compatibile con Node.js 18+

## File Importanti da Non Committare

Il file `.gitignore` è già configurato per escludere:
- `node_modules/`
- `.next/`
- `.env*` (file con chiavi API)
- `.vercel/`

## Prossimi Passi Dopo il Push

1. ✅ Il codice è su GitHub
2. 🔗 Collega a Vercel per il deploy automatico
3. 🌐 Ottieni un link pubblico per il sito

---

**Hai bisogno di aiuto?** Vedi [DEPLOY.md](./DEPLOY.md) per il deploy su Vercel.

