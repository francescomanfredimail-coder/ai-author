#!/usr/bin/env node

/**
 * Script di verifica per il deploy
 * Esegui: node check-deploy.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifica configurazione deploy...\n');

let errors = [];
let warnings = [];

// Verifica file necessari
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'vercel.json',
  'src/app/layout.tsx',
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file} trovato`);
  } else {
    errors.push(`❌ ${file} mancante`);
  }
});

// Verifica package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!packageJson.scripts || !packageJson.scripts.build) {
    errors.push('❌ Script "build" mancante in package.json');
  } else {
    console.log('✅ Script build presente');
  }
  
  if (!packageJson.dependencies || !packageJson.dependencies.next) {
    errors.push('❌ Next.js non trovato nelle dipendenze');
  } else {
    console.log(`✅ Next.js ${packageJson.dependencies.next} installato`);
  }
} catch (e) {
  errors.push(`❌ Errore leggendo package.json: ${e.message}`);
}

// Verifica vercel.json
try {
  const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json valido');
} catch (e) {
  errors.push(`❌ vercel.json non valido: ${e.message}`);
}

// Verifica variabili d'ambiente
if (!fs.existsSync('.env.local') && !fs.existsSync('.env')) {
  warnings.push('⚠️  File .env non trovato (necessario per sviluppo locale)');
} else {
  console.log('✅ File .env trovato');
}

// Verifica struttura directory
const requiredDirs = [
  'src/app',
  'src/components',
  'src/lib',
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(path.join(process.cwd(), dir))) {
    console.log(`✅ Directory ${dir} presente`);
  } else {
    errors.push(`❌ Directory ${dir} mancante`);
  }
});

// Riepilogo
console.log('\n📊 Riepilogo:');
console.log('─'.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Tutto sembra a posto!');
  console.log('\n📝 Prossimi passi:');
  console.log('1. Assicurati di avere OPENAI_API_KEY configurata su Vercel');
  console.log('2. Esegui: vercel --prod');
  console.log('3. Verifica il link fornito da Vercel');
} else {
  if (errors.length > 0) {
    console.log('\n❌ Errori trovati:');
    errors.forEach(err => console.log(`   ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Avvisi:');
    warnings.forEach(warn => console.log(`   ${warn}`));
  }
  
  console.log('\n💡 Suggerimenti:');
  if (errors.some(e => e.includes('mancante'))) {
    console.log('- Verifica che tutti i file necessari siano presenti');
  }
  if (warnings.some(w => w.includes('.env'))) {
    console.log('- Crea un file .env.local per lo sviluppo locale');
  }
}

console.log('\n');

