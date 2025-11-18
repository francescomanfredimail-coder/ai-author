#!/bin/bash

echo "🔄 Redeploy su Vercel"
echo ""

# Verifica se Vercel CLI è installato
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI non trovato"
    echo ""
    echo "Installa Vercel CLI:"
    echo "  npm i -g vercel"
    echo ""
    exit 1
fi

echo "📤 Facendo redeploy in produzione..."
echo ""

# Redeploy
vercel --prod

echo ""
echo "✅ Redeploy completato!"
echo ""
echo "🔗 Il tuo sito sarà disponibile tra 1-2 minuti sul link pubblico"
echo ""

