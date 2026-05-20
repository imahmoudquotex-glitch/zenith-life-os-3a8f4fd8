import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zenith',
    short_name: 'Zenith',
    description: 'Zenith — Secure Productivity OS',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0e14',
    theme_color: '#0b0e14',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    orientation: 'any',
    scope: '/',
    lang: 'ar',
    dir: 'rtl',
    shortcuts: [
      { name: 'Today', url: '/today', description: 'Open today view' },
      { name: 'Notes', url: '/notes', description: 'Open notes' },
    ],
  };
}
