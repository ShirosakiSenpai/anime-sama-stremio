# Anime-Sama Stremio — prototype 0.1.0

Cette version est un prototype local. Elle réutilise le bundle `providers/anime-sama.js` fourni dans le dépôt Gowaru Nuvio Providers et l'expose via les routes Stremio `/manifest.json` et `/stream/...`.

## Prérequis
- Node.js 20 ou plus récent
- Une clé API TMDB personnelle (variable d'environnement `TMDB_API_KEY`)
- Connexion Internet

## Lancer sous Windows PowerShell
1. Décompresser l'archive.
2. Ouvrir PowerShell dans le dossier `anime-sama-stremio-addon`.
3. Définir la clé TMDB : `$env:TMDB_API_KEY="VOTRE_CLE_TMDB"`
4. Lancer : `npm start`
5. Dans Stremio sur le même PC, ouvrir `http://localhost:7000/manifest.json` dans le navigateur puis utiliser l'URL du manifest pour installer l'addon : `http://localhost:7000/manifest.json`.

Pour la box Android sur le même réseau Wi-Fi, remplacer `localhost` par l'adresse IPv4 locale du PC, par exemple `http://192.168.1.25:7000/manifest.json`. Autoriser Node.js dans le pare-feu Windows sur réseau privé.

## Limites connues
- Prototype de flux uniquement : pas de catalogue ni de métadonnées.
- Les IDs `tt...` sont convertis via TMDB ; les IDs `tmdb:123` sont acceptés directement.
- Les flux ne sont pas testés en lecture dans Stremio. Certains lecteurs/hébergeurs exigent des en-têtes ou un déchiffrement supplémentaires ; l'URL extraite par le provider peut être un lien de lecteur intégré plutôt qu'un fichier vidéo direct.
- Aucun service de proxy vidéo n'est fourni.
- Le provider source peut changer si Anime-Sama modifie son site. Respectez les lois applicables et les conditions des sites consultés.

## Origine
Le bundle `anime-sama-provider.js` est repris du dépôt `Gowaru/nuvio-providers` (licence GPL-3.0). Le code de ce prototype est fourni sous GPL-3.0 également. Conservez cette notice si vous redistribuez le projet.
