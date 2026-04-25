import type { StretchPaneState } from './types'

export const SOURCE_DEFAULTS: StretchPaneState = {
  baseDark: 0,
  curlStrength: 2.2,
  densityDissipation: 0.97,
  displacement: 0.8,
  fluid: 0.3,
  fluidLine: 0.8,
  frostAmount: 0.23,
  hoverDelay: 50,
  hoverDuration: 0.3,
  lines: 22,
  pressureDissipation: 0.4,
  pressureIterations: 3,
  scrollClamp: 450,
  splatForce: 5,
  splatRadius: 0.06 / 100,
  velocityDissipation: 0.9,
  velocityFactor: 1.35,
}

export const PREVIEW_LAYOUTS = [
  {
    format: 'square',
    href: 'https://unsplash.com/s/photos/interior',
    id: 'warm-interior',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Sunlit Architecture',
    title: 'Warm Interior',
  },
  {
    format: 'rectangle',
    href: 'https://unsplash.com/s/photos/landscape',
    id: 'valley-light',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Alpine Landscape',
    title: 'Valley Light',
  },
  {
    format: 'square',
    href: 'https://unsplash.com/s/photos/night-sky',
    id: 'night-ridge',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Stargazing',
    title: 'Night Ridge',
  },
  {
    format: 'rectangle',
    href: 'https://unsplash.com/s/photos/forest',
    id: 'forest-walk',
    image:
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Moss and Mist',
    title: 'Forest Walk',
  },
  {
    format: 'square',
    href: 'https://unsplash.com/s/photos/desert',
    id: 'desert-road',
    image:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Open Horizon',
    title: 'Desert Road',
  },
  {
    format: 'square',
    href: 'https://unsplash.com/s/photos/ocean',
    id: 'tidal-flow',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Ocean Texture',
    title: 'Tidal Flow',
  },
  {
    format: 'rectangle',
    href: 'https://unsplash.com/s/photos/mountain-lake',
    id: 'mountain-lake',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Glacial Morning',
    title: 'Mountain Lake',
  },
  {
    format: 'square',
    href: 'https://unsplash.com/s/photos/beach',
    id: 'coastline',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Salt and Sun',
    title: 'Coastline',
  },
  {
    format: 'square',
    href: 'https://unsplash.com/s/photos/city',
    id: 'city-frame',
    image:
      'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=1610&h=1000&q=80',
    subtitle: 'Urban Detail',
    title: 'City Frame',
  },
]

export const PREVIEW_SPACING = 20
