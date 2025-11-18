#!/bin/bash

echo "🚀 Push del progetto su GitHub..."
echo ""

# Verifica che siamo nel branch main
git branch -M main

# Mostra lo stato
echo "📊 Stato repository:"
git status --short
echo ""

# Chiedi conferma
read -p "Vuoi procedere con il push? (s/n): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "❌ Operazione annullata"
    exit 1
fi

echo ""
echo "📤 Facendo push su GitHub..."
echo "💡 Se richiesto, inserisci:"
echo "   Username: francescomanfredimail-coder"
echo "   Password: usa un Personal Access Token (non la password GitHub)"
echo "   Crea un token qui: https://github.com/settings/tokens"
echo ""

# Prova il push
if git push -u origin main; then
    echo ""
    echo "✅ Push completato con successo!"
    echo ""
    echo "🔗 Il tuo codice è disponibile su:"
    echo "   https://github.com/francescomanfredimail-coder/ai-author"
    echo ""
else
    echo ""
    echo "❌ Errore durante il push"
    echo ""
    echo "💡 Soluzione rapida:"
    echo "   1. Vai su: https://github.com/settings/tokens"
    echo "   2. Crea un nuovo token (classic) con permessi 'repo'"
    echo "   3. Esegui di nuovo: bash push-to-github.sh"
    echo "   4. Quando richiesto, usa il token come password"
    echo ""
fi

