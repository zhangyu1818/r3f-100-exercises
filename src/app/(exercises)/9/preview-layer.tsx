import type { MouseEvent, RefObject, PointerEvent } from 'react'

import { PREVIEW_LAYOUTS } from './constants'

export function PreviewLayer({
  fullscreen = false,
  hoveredPreview,
  onPreviewClick,
  onPreviewPointerDown,
  previewRefs,
}: {
  fullscreen?: boolean
  hoveredPreview: RefObject<number | null>
  onPreviewClick: (event: MouseEvent<HTMLElement>) => void
  onPreviewPointerDown: (event: PointerEvent<HTMLElement>) => void
  previewRefs: RefObject<(HTMLElement | null)[]>
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[22px] bottom-[22px] z-20">
      <div className="relative h-full w-full">
        {PREVIEW_LAYOUTS.map((layout, index) => (
          <a
            key={layout.id}
            ref={(node) => {
              previewRefs.current[index] = node
            }}
            aria-label={`${layout.title} ${layout.subtitle}`}
            className={[
              'group pointer-events-auto absolute top-1/2 left-0 block cursor-pointer touch-pan-y select-none overflow-hidden rounded-[20px] outline-none',
              fullscreen ? 'h-[80vh]' : 'h-[70%]',
              layout.format === 'rectangle'
                ? 'aspect-[1.61/1]'
                : 'aspect-square',
            ].join(' ')}
            draggable={false}
            href={layout.href}
            onBlur={() => {
              if (hoveredPreview.current === index) {
                hoveredPreview.current = null
              }
            }}
            onClick={onPreviewClick}
            onFocus={() => {
              hoveredPreview.current = index
            }}
            onPointerDown={onPreviewPointerDown}
            onPointerEnter={() => {
              hoveredPreview.current = index
            }}
            onPointerLeave={() => {
              if (hoveredPreview.current === index) {
                hoveredPreview.current = null
              }
            }}
            rel="noreferrer"
            style={{
              transform: 'translate3d(0, -50%, 0)',
              visibility: 'hidden',
            }}
            target="_blank"
          >
            <img
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 select-none"
              crossOrigin="anonymous"
              draggable={false}
              src={layout.image}
            />
            <span className="pointer-events-none absolute bottom-[clamp(18px,2.5vh,40px)] left-[clamp(18px,3vw,36px)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="block text-[clamp(1.6rem,4vh,3.2rem)] leading-none font-light text-white [text-shadow:2px_2px_3px_rgba(0,0,0,0.18)]">
                {layout.title}
              </span>
              <span className="mt-2 block max-w-[min(24rem,60vw)] text-[clamp(0.7rem,1.1vh,1rem)] leading-tight font-medium tracking-[0.18rem] text-white uppercase [text-shadow:2px_2px_3px_rgba(0,0,0,0.35)]">
                {layout.subtitle}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
