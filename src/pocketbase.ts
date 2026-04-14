import PocketBase from 'pocketbase';

// L'URL de votre serveur PocketBase (par défaut local, à remplacer par votre URL de production)
// Exemple: https://sama-butik.pockethost.io
const pbUrl = (import.meta as any).env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(pbUrl);

// Désactiver l'auto-annulation pour éviter les erreurs lors de requêtes simultanées
pb.autoCancellation(false);
