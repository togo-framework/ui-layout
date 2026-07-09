'use client'

/**
 * RouteProgress — a thin top-of-viewport progress bar that animates on every
 * route change.
 *
 * Why: the product dashboards are client components ('use client' pages that
 * fetch in useEffect), so Next's `loading.tsx` Suspense boundary only flashes
 * on the initial server navigation — between client-side page transitions there
 * was NO visible loading indicator. This bar fills the gap: it shows a brand
 * progress bar whenever the `pathname` prop changes and completes shortly after.
 *
 * Framework-agnostic: @prism/ui has NO `next` dependency, so this component
 * does NOT import `next/navigation`. The consuming app passes the current path
 * via the `pathname` prop (e.g. `<RouteProgress pathname={usePathname()} />`).
 * Mount it ONCE near the root of each product (inside LanguageProvider/layout).
 *
 * Operator request 2026-06-05: "loader between pages" was missing on all products.
 */

import { useEffect, useRef, useState } from 'react'

export interface RouteProgressProps {
  /**
   * The current route path. Pass `usePathname()` from the app. Whenever this
   * value changes the bar animates. Required — the app owns the router binding.
   */
  pathname: string
  /** Bar height in px. Default 2. */
  height?: number
}

const RouteProgress = ({ pathname, height = 2 }: RouteProgressProps) => {
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const firstRender = useRef(true)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // Skip the very first mount — only animate on actual navigations.
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    // Clear any in-flight timers from a previous transition.
    timers.current.forEach(clearTimeout)
    timers.current = []

    // Start: show + ramp up to ~90% quickly (trickle), then complete + hide.
    setVisible(true)
    setWidth(10)
    timers.current.push(setTimeout(() => setWidth(70), 50))
    timers.current.push(setTimeout(() => setWidth(90), 250))
    timers.current.push(setTimeout(() => setWidth(100), 500))
    timers.current.push(
      setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 750),
    )

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [pathname])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        insetInlineStart: 0,
        width: `${width}%`,
        height: `${height}px`,
        opacity: visible ? 1 : 0,
        transition: 'width 200ms ease-out, opacity 200ms ease-out',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className="bg-primary"
    />
  )
}

RouteProgress.displayName = 'RouteProgress'

export { RouteProgress }
export default RouteProgress
