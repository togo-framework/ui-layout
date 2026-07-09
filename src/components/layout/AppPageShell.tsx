'use client'

// AppPageShell — ported from app/src/components/layout/AppPageShell.tsx
//
// Adaptation notes:
//   useAuth           → isAuthenticated + isAuthLoading + onUnauthenticated props
//   useNavigationState → currentView + scope + onViewChange + onScopeChange props
//   useLanguage       → isRTL prop
//   UnifiedTopNav     → topNavSlot prop (product layer provides the full nav component)
//   CriticalAlertsBar / NewsChannelBanner / NotificationTicker / BreakingNewsTicker
//                     → realtimeSlotsTop + realtimeSlotsBottom props
//                       (product layer injects the live banners; sentra-ui is unaware of data)
//   next/navigation   → onUnauthenticated callback (no hard Next.js dep here)

import React from 'react'

export interface AppPageShellProps {
  children: React.ReactNode
  /** Whether the current layout direction is RTL */
  isRTL: boolean
  /** Called when auth check fails — product layer does the redirect */
  isAuthenticated?: boolean
  isAuthLoading?: boolean
  onUnauthenticated?: () => void
  /** Full nav element rendered above content (UnifiedTopNav in app layer) */
  topNavSlot?: React.ReactNode
  /** Slots for real-time banners rendered between nav and main content
   *  (CriticalAlertsBar, NewsChannelBanner, NotificationTicker) */
  realtimeSlotsTop?: React.ReactNode
  /** Slot for the footer ticker (BreakingNewsTicker) */
  realtimeSlotBottom?: React.ReactNode
  /** Backward-compat: copilotSeeds (unused) */
  copilotSeeds?: string[]
}

const AppPageShell = ({
  children,
  isRTL,
  isAuthenticated,
  isAuthLoading,
  onUnauthenticated,
  topNavSlot,
  realtimeSlotsTop,
  realtimeSlotBottom,
  // copilotSeeds accepted for backward-compat but not used
  copilotSeeds: _copilotSeeds,
}: AppPageShellProps) => {
  // Auth gate — product layer handles the actual redirect
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated === false) {
      onUnauthenticated?.()
    }
  }, [isAuthLoading, isAuthenticated, onUnauthenticated])

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    )
  }

  if (isAuthenticated === false) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {topNavSlot}
      {realtimeSlotsTop}
      <main className="flex-1 overflow-y-auto">{children}</main>
      {realtimeSlotBottom}
    </div>
  )
}

AppPageShell.displayName = 'AppPageShell'

export { AppPageShell }
export default AppPageShell