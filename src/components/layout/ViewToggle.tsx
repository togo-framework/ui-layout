'use client'

// ViewToggle — ported from app/src/components/navigation/ViewToggle.tsx
//
// Adaptation notes:
//   framer-motion   → NOT available in sentra-ui deps; animated pill replaced
//                     with a CSS transition approach (no layout animation)
//   useRouter / usePathname → onViewChange callback + currentPathname prop
//   useLanguage     → language prop
//   useIsMobile     → isMobile prop
//   @/lib/navigation types → inlined here as simple string literals

import { LayoutGrid, Star, FolderKanban } from 'lucide-react'
import { cn } from '@togo-framework/ui-core'

export type View = 'foryou' | 'dashboard' | 'projects'

interface ViewDefinition {
  id: View
  icon: React.ComponentType<{ className?: string }>
  labelEn: string
  labelAr: string
  path: string
}

const VIEWS: ViewDefinition[] = [
  { id: 'foryou',    icon: Star,          labelEn: 'For You',   labelAr: 'لك',       path: '/for-you' },
  { id: 'dashboard', icon: LayoutGrid,    labelEn: 'Dashboard', labelAr: 'اللوحة',   path: '/dashboard' },
  { id: 'projects',  icon: FolderKanban,  labelEn: 'Projects',  labelAr: 'المشاريع', path: '/projects' },
]

export interface ViewToggleProps {
  currentView?: View
  language: 'en' | 'ar'
  isMobile?: boolean
  /** Current URL path — used to derive active view */
  currentPathname?: string
  /** Called with the new view when the user clicks */
  onViewChange: (view: View) => void
  /** Called to navigate to a path */
  onNavigate?: (path: string) => void
}

const ViewToggle = ({
  language,
  isMobile,
  currentPathname,
  currentView,
  onViewChange,
  onNavigate,
}: ViewToggleProps) => {
  // Derive active view from pathname (same logic as original)
  const activeView =
    VIEWS.find((v) => currentPathname?.startsWith(v.path))?.id ??
    currentView ??
    'dashboard'

  const handleClick = (view: ViewDefinition) => {
    onNavigate?.(view.path)
    if (activeView !== view.id) {
      onViewChange(view.id)
    }
  }

  return (
    <div className="flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5">
      {VIEWS.map((view) => {
        const Icon = view.icon
        const isActive = activeView === view.id
        const label = language === 'ar' ? view.labelAr : view.labelEn

        return (
          <button
            key={view.id}
            onClick={() => handleClick(view)}
            className={cn(
              'relative flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-fast ease-standard',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="relative z-10 w-4 h-4" />
            {!isMobile && <span className="relative z-10">{label}</span>}
          </button>
        )
      })}
    </div>
  )
}

ViewToggle.displayName = 'ViewToggle'

export { ViewToggle }
export default ViewToggle