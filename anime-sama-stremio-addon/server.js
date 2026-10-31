'use strict';
const http = require('node:http');
const { URL } = require('node:url');
const provider = require('./anime-sama-provider.js');

const PORT = Number(process.env.PORT || 7000);
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const MANIFEST = {
  id: 'fr.silver.animesama',
  version: '0.1.0',
  name: 'Anime-Sama (test)',
  description: 'Prototype communautaire : recherche de flux Anime-Sama via le provider Nuvio adapté au protocole Stremio.',
  resources: ['stream'],
  types: ['series', 'movie'],
  idPrefixes: ['tt', 'tmdb:'],
  catalogs: []
};

function send(res, status, body) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(body));
}
async function tmdbIdFromStremio(id) {
  if (/^tmdb:\d+$/.test(id)) return id.slice(5);
  if (!/^tt\d+$/.test(id)) throw new Error('Identifiant non pris en charge : ' + id);
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY manquante. Configure la variable d’environnement.');
  const u = new URL(`https://api.themoviedb.org/3/find/${encodeURIComponent(id)}`);
  u.searchParams.set('external_source', 'imdb_id');
  u.searchParams.set('api_key', TMDB_API_KEY);
  const r = await fetch(u, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`TMDB HTTP ${r.status}`);
  const data = await r.json();
  const item = (data.tv_results || [])[0] || (data.movie_results || [])[0];
  if (!item) throw new Error('Aucune correspondance TMDB pour ' + id);
  return String(item.id);
}
async function handleStream(type, rawId) {
  // Stremio encodes series IDs as ttXXXX:season:episode.
  const bits = rawId.split(':');
  const stremioId = bits[0];
  const season = type === 'series' ? Number(bits[1]) : 1;
  const episode = type === 'series' ? Number(bits[2]) : 1;
  if (type === 'series' && (!Number.isInteger(season) || !Number.isInteger(episode) || season < 1 || episode < 1)) {
    throw new Error('Format épisode invalide.');
  }
  const tmdbId = await tmdbIdFromStremio(stremioId);
  const streams = await provider.getStreams(tmdbId, type === 'series' ? 'tv' : 'movie', season, episode, {});
  return (Array.isArray(streams) ? streams : []).filter(s => s && typeof s.url === 'string' && /^https?:\/\//i.test(s.url)).map((s, i) => ({
    name: s.name || 'Anime-Sama',
    title: s.title || `Anime-Sama • ${s.language || 'Flux'} • ${s.quality || 'Qualité inconnue'}`,
    url: s.url,
    behaviorHints: s.headers ? { proxyHeaders: { request: s.headers } } : undefined
  }));
}
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 200, {});
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/manifest.json') return send(res, 200, MANIFEST);
  const m = url.pathname.match(/^\/stream\/(series|movie)\/([^/]+)\.json$/);
  if (m) {
    try {
      const streams = await handleStream(m[1], decodeURIComponent(m[2]));
      return send(res, 200, { streams });
    } catch (e) {
      console.error('[addon]', e.message);
      return send(res, 200, { streams: [], error: e.message });
    }
  }
  return send(res, 404, { error: 'Not found' });
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Anime-Sama Stremio prototype: http://localhost:${PORT}/manifest.json`);
  if (!TMDB_API_KEY) console.log('Attention : définis TMDB_API_KEY pour résoudre les identifiants IMDb.');
});
