/**
 * sw.js — Service worker minimaliste Liass'Pilot
 *
 * Objectifs :
 *   1. Rendre l'application installable (PWA) en exposant un fetch handler
 *      (critère obligatoire des navigateurs pour autoriser "Installer l'app").
 *   2. Mise en cache du shell (index.html + icône) pour ouverture rapide
 *      au prochain démarrage et écran d'attente offline.
 *   3. Stratégie network-first pour le HTML (toujours dernière version),
 *      cache-first pour les assets fingerprintés (immutables par Vite).
 *
 * Volontairement minimaliste — pas de Workbox, pas de précache massif :
 *   - Vite hash déjà les bundles → ils sont cachés naturellement par le
 *     HTTP cache du navigateur. Le SW se contente de garantir un fallback
 *     en cas de coupure réseau brève (ex: passage tunnel, wifi instable).
 *   - Pas de cache invalidation manuelle requise : à chaque déploiement,
 *     l'index.html network-first récupère les bonnes URLs hashées, et
 *     l'incrément SW_VERSION ci-dessous évince le cache obsolète.
 *
 * Note : ce SW est volontairement non-bloquant. Si l'enregistrement échoue
 * (Safari iOS strict, mode incognito, etc.) l'app reste 100 % fonctionnelle.
 */

const SW_VERSION = 'v1'
const SHELL_CACHE = `liasspilot-shell-${SW_VERSION}`
const SHELL_ASSETS = ['/', '/index.html', '/fiscasync-icon.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('liasspilot-shell-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // On ne gère que les requêtes same-origin (pas Supabase, pas fonts.googleapis…)
  if (url.origin !== self.location.origin) return

  // Navigation HTML : network-first, fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy)).catch(() => undefined)
          return response
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || new Response('Hors ligne', { status: 503 }))
        )
    )
    return
  }

  // Assets statiques : cache-first
  if (url.pathname.startsWith('/assets/') || SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const copy = response.clone()
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
          }
          return response
        })
      })
    )
  }
})
