#!/bin/bash

# Script per configurare il repository GitHub
# Usa: bash setup-github.sh

echo "🚀 Configurazione repository GitHub per Lama Bollente"
echo ""

# Chiedi il nome utente GitHub
read -p "Inserisci il tuo username GitHub: " GITHUB_USERNAME

# Chiedi il nome del repository
read -p "Inserisci il nome del repository (default: lama-bollente): " REPO_NAME
REPO_NAME=${REPO_NAME:-lama-bollente}

echo ""
echo "📝 Istruzioni:"
echo "1. Vai su https://github.com/new"
echo "2. Crea un nuovo repository chiamato: $REPO_NAME"
echo "3. NON inizializzare con README, .gitignore o licenza"
echo "4. Dopo aver creato il repository, premi INVIO qui"
read -p "Premi INVIO quando hai creato il repository su GitHub..."

echo ""
echo "🔗 Aggiungo il remote e faccio push..."
echo ""

# Aggiungi il remote
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Verifica il remote
echo "✅ Remote configurato:"
git remote -v

echo ""
echo "📤 Facendo push del codice..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Fatto! Il tuo codice è su GitHub:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

