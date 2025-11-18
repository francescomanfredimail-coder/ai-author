#!/bin/bash

echo "🚀 Push su GitHub - Lama Bollente"
echo ""

# Chiedi username
read -p "Inserisci il tuo username GitHub (francescomanfredimail-coder): " USERNAME
USERNAME=${USERNAME:-francescomanfredimail-coder}

# Chiedi token
echo ""
read -sp "Inserisci il tuo Personal Access Token (ghp_...): " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
    echo "❌ Token non inserito!"
    exit 1
fi

# Configura il remote con il token
git remote set-url origin https://${USERNAME}:${TOKEN}@github.com/${USERNAME}/ai-author.git

echo ""
echo "📤 Facendo push..."
echo ""

# Esegui il push
if git push -u origin main; then
    echo ""
    echo "✅ Push completato con successo!"
    echo ""
    echo "🔗 Il tuo codice è disponibile su:"
    echo "   https://github.com/francescomanfredimail-coder/ai-author"
    echo ""
    
    # Rimuovi il token dal remote per sicurezza
    git remote set-url origin https://github.com/${USERNAME}/ai-author.git
    echo "🔒 Token rimosso dal remote per sicurezza"
else
    echo ""
    echo "❌ Errore durante il push"
    echo "   Verifica che username e token siano corretti"
fi

