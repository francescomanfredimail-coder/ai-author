# 🔑 Guida Creazione Token GitHub - Passo Passo

## Metodo 1: Creare un Personal Access Token (Classic)

### Passo 1: Accedi a GitHub
1. Vai su **https://github.com**
2. Assicurati di essere loggato con il tuo account

### Passo 2: Vai alle Impostazioni
1. Clicca sulla tua **foto profilo** in alto a destra
2. Clicca su **Settings** (Impostazioni)

### Passo 3: Vai alla Sezione Developer Settings
1. Nella barra laterale sinistra, scorri fino in fondo
2. Clicca su **Developer settings** (ultima voce in basso)

### Passo 4: Personal Access Tokens
1. Nella barra laterale sinistra, clicca su **Personal access tokens**
2. Clicca su **Tokens (classic)**

### Passo 5: Genera Nuovo Token
1. Clicca sul pulsante **Generate new token**
2. Seleziona **Generate new token (classic)**

### Passo 6: Configura il Token
1. **Note** (Nome): Scrivi `ai-author-push` o qualsiasi nome che ricordi
2. **Expiration** (Scadenza): Scegli una durata (es. 90 giorni o No expiration)
3. **Select scopes** (Permessi): 
   - ✅ Seleziona **repo** (questo include tutti i permessi del repository)
   - Oppure seleziona manualmente:
     - ✅ `repo` (tutti i permessi)
     - ✅ `workflow` (se vuoi usare GitHub Actions)

### Passo 7: Genera e Copia
1. Scorri in basso e clicca **Generate token**
2. ⚠️ **IMPORTANTE**: Copia subito il token! Inizia con `ghp_...`
3. Salvalo in un posto sicuro (non lo vedrai più!)

## Metodo 2: Link Diretto

Puoi anche andare direttamente a:
**https://github.com/settings/tokens/new**

## Come Usare il Token

Quando esegui:
```bash
git push -u origin main
```

Ti chiederà:
- **Username**: `francescomanfredimail-coder`
- **Password**: **NON usare la tua password GitHub**, usa il token che hai copiato!

## Metodo Alternativo: Usare SSH (Più Semplice)

Se preferisci, puoi configurare SSH invece del token:

1. Genera una chiave SSH (se non ce l'hai):
```bash
ssh-keygen -t ed25519 -C "la-tua-email@example.com"
```

2. Copia la chiave pubblica:
```bash
cat ~/.ssh/id_ed25519.pub
```

3. Aggiungi la chiave su GitHub:
   - Vai su: https://github.com/settings/keys
   - Clicca "New SSH key"
   - Incolla la chiave

4. Cambia il remote a SSH:
```bash
git remote set-url origin git@github.com:francescomanfredimail-coder/ai-author.git
git push -u origin main
```

## Problemi?

Se non trovi "Developer settings":
- Assicurati di essere loggato
- Prova il link diretto: https://github.com/settings/tokens
- Cerca "Personal access tokens" nella barra di ricerca di GitHub

