// Sistema di autenticazione semplice

export interface User {
  username: string;
  password: string;
}

// Account predefiniti
export const USERS: User[] = [
  { username: 'alpha', password: '1234' },
  { username: 'beta', password: '1234' },
  { username: 'gamma', password: '1234' },
  { username: 'admin', password: 'admin' },
];

// Verifica credenziali
export function verifyCredentials(username: string, password: string): boolean {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  return !!user;
}

// Gestione sessione (localStorage)
const AUTH_KEY = 'lama-bollente-auth';

export function setAuth(username: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, username);
    // Ricarica i dati per il nuovo utente
    // Ricarica lo store
    const { useStore } = require('./store');
    useStore.persist.rehydrate();
    // Ricarica le memorie
    const { memoryManager } = require('./memory');
    memoryManager.reloadForUser();
    // Forza un refresh della pagina per ricaricare tutti i dati
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
}

export function getAuth(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_KEY);
  }
  return null;
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
    // Pulisci i dati quando si fa logout (opzionale, commentato per mantenere i dati)
    // const { useStore } = require('./store');
    // useStore.setState({ projects: [], currentProject: null, creditUsage: [], totalCreditsUsed: 0 });
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    const username = localStorage.getItem(AUTH_KEY);
    return !!username && USERS.some((u) => u.username === username);
  }
  return false;
}

