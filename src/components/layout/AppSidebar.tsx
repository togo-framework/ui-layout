'use client'

// AppSidebar — ported from app/src/components/layout/AppSidebar.tsx
//
// Adaptation notes:
//   useAuth         → user + profile + isLoading + onSignOut props
//   useLanguage     → language + isRTL props
//   useTenantBranding → appName + logo props (U1's BrandingProvider supplies CSS vars;
//                       header consumes them — here we accept them as direct props so
//                       the sidebar is standalone without a context dependency)
//   useConversations → conversations + isConversationsLoading props (optional; if not
//                       supplied the ChatsSection is hidden — caller can inject their own)
//   usePathname / useRouter → not imported; navigation is handled via onNavigate callback
//                             or hrefs supplied in navItems
//   Link (next/link) → replaced by <a> tags (product-layer provides Next.js;
//                       we keep href strings and an onNavigate seam)
//   Sidebar primitives → from ../ui/sidebar (already in sentra-ui)

import { useState } from 'react'
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Shield,
  ChevronDown,
  Sparkles,
  ChartArea,
  Search,
  SquarePen,
  MessageCircle,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@togo-framework/ui-core'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActiveTab = 'assistant' | 'analysis'

export interface SidebarUser {
  email: string | null
  displayName: string | null
  avatarUrl?: string
}

export interface SidebarConversation {
  id: string
  title_en: string
  title_ar?: string | null
}

export interface AppSidebarProps {
  /** Locale */
  language: 'en' | 'ar'
  isRTL: boolean
  /** Branding — from BrandingProvider (U1) or direct props */
  appName?: string
  logo?: string
  /** Auth */
  user?: SidebarUser | null
  isAuthLoading?: boolean
  onSignOut?: () => void | Promise<void>
  /** Navigation callbacks — product layer provides these */
  onNavigate?: (href: string) => void
  /** Current pathname — used to highlight active tab and conversations */
  currentPathname?: string
  /** Chat / conversation data (optional — hides the section when absent) */
  conversations?: SidebarConversation[]
  isConversationsLoading?: boolean
  /** Tab hrefs */
  assistantHref?: string
  analysisHref?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isArabicText = (text: string): boolean => /[؀-ۿ]/.test(text)

const getUserInitials = (displayName: string | null, email: string | null): string => {
  if (displayName) {
    return displayName
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) return email.charAt(0).toUpperCase()
  return 'U'
}

// ---------------------------------------------------------------------------
// SidebarLogo
// ---------------------------------------------------------------------------

const SidebarLogo = ({
  appName,
  logo,
  onNavigate,
  assistantHref,
  language = 'en',
}: {
  appName: string
  logo?: string
  onNavigate?: (href: string) => void
  assistantHref: string
  language?: 'en' | 'ar'
}) => {
  const { open, isMobile, toggleSidebar } = useSidebar()
  const isSidebarOpen = open || isMobile
  const initial = (appName[0] || 'S').toUpperCase()

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate?.(assistantHref)
  }

  if (isSidebarOpen) {
    return (
      <header className="flex items-center justify-between w-full">
        <a
          href={assistantHref}
          onClick={handleLogoClick}
          className="flex items-center gap-2 min-w-0"
        >
          {logo ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white px-0.5">
              <img
                src={logo}
                alt={appName}
                className="max-h-6 max-w-full object-contain"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          <span className="text-base font-semibold tracking-tight truncate">{appName}</span>
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 p-0 hover:bg-muted cursor-pointer"
          onClick={toggleSidebar}
          aria-label={language === 'ar' ? 'طي الشريط الجانبي' : 'Collapse sidebar'}
        >
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        </Button>
      </header>
    )
  }

  return (
    <header className="flex flex-col items-center justify-center gap-2">
      <a
        href={assistantHref}
        onClick={handleLogoClick}
        className="flex items-center justify-center"
        aria-label={appName}
      >
        {logo ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white px-0.5">
            <img
              src={logo}
              alt={appName}
              className="max-h-6 max-w-full object-contain"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">{initial}</span>
          </div>
        )}
      </a>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-muted cursor-pointer"
        onClick={toggleSidebar}
        aria-label={language === 'ar' ? 'توسيع الشريط الجانبي' : 'Expand sidebar'}
      >
        <PanelLeftOpen className="h-4 w-4 text-muted-foreground" />
      </Button>
    </header>
  )
}
SidebarLogo.displayName = 'SidebarLogo'

// ---------------------------------------------------------------------------
// NavigationTabs
// ---------------------------------------------------------------------------

const NavigationTabs = ({
  activeTab,
  onTabChange,
  language,
  isRTL,
  onNavigate,
  assistantHref,
  analysisHref,
}: {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  language: 'en' | 'ar'
  isRTL: boolean
  onNavigate?: (href: string) => void
  assistantHref: string
  analysisHref: string
}) => {
  const { open, isMobile } = useSidebar()
  const isSidebarOpen = open || isMobile

  const tabs: {
    id: ActiveTab
    labelEn: string
    labelAr: string
    icon: React.ComponentType<{ className?: string }>
    href: string
  }[] = [
    { id: 'assistant', labelEn: 'Assistant', labelAr: 'المساعد', icon: Sparkles, href: assistantHref },
    { id: 'analysis', labelEn: 'Analysis', labelAr: 'التحليل', icon: ChartArea, href: analysisHref },
  ]

  return (
    <nav aria-label="Primary navigation">
      <div
        className={cn(
          isSidebarOpen
            ? 'flex flex-row gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-sm'
            : 'flex flex-col gap-1',
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const label = language === 'ar' ? tab.labelAr : tab.labelEn

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault()
            onTabChange(tab.id)
            onNavigate?.(tab.href)
          }

          const tabContent = (
            <a
              href={tab.href}
              onClick={handleClick}
              className={cn(
                'flex items-center justify-center rounded-md py-2 transition-colors duration-fast ease-standard',
                isSidebarOpen ? 'flex-1 gap-2 px-3' : 'w-full px-2',
                isActive
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {isSidebarOpen && (
                <span className={cn('text-sm font-medium', isRTL ? 'text-right' : 'text-left')}>
                  {label}
                </span>
              )}
            </a>
          )

          if (!isSidebarOpen) {
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>{tabContent}</TooltipTrigger>
                <TooltipContent
                  side={isRTL ? 'left' : 'right'}
                  className="bg-popover text-popover-foreground border border-border text-sm"
                >
                  {label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={tab.id}>{tabContent}</div>
        })}
      </div>
    </nav>
  )
}
NavigationTabs.displayName = 'NavigationTabs'

// ---------------------------------------------------------------------------
// SearchAndReports
// ---------------------------------------------------------------------------

const SearchAndReports = ({
  language,
  isRTL,
  onNavigate,
  assistantHref,
}: {
  language: 'en' | 'ar'
  isRTL: boolean
  onNavigate?: (href: string) => void
  assistantHref: string
}) => {
  const { open, isMobile } = useSidebar()
  const isSidebarOpen = open || isMobile

  const items = [
    {
      id: 'search',
      labelEn: 'Search',
      labelAr: 'البحث',
      icon: Search,
      href: `${assistantHref}?mode=search`,
    },
    {
      id: 'new-chat',
      labelEn: 'New Chat',
      labelAr: 'محادثة جديدة',
      icon: SquarePen,
      href: assistantHref,
    },
  ]

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        const label = language === 'ar' ? item.labelAr : item.labelEn
        const handleClick = (e: React.MouseEvent) => {
          e.preventDefault()
          onNavigate?.(item.href)
        }

        const content = (
          <a
            key={item.id}
            href={item.href}
            onClick={handleClick}
            className={cn(
              'flex items-center rounded-md transition-colors duration-fast ease-standard hover:bg-muted cursor-pointer w-full',
              isSidebarOpen ? 'gap-2 p-2' : 'justify-center p-2',
            )}
          >
            <Icon className={cn('shrink-0', isSidebarOpen ? 'h-4 w-4' : 'h-5 w-5')} />
            {isSidebarOpen && (
              <span className={cn('text-sm text-foreground', isRTL ? 'text-right' : 'text-left')}>
                {label}
              </span>
            )}
          </a>
        )

        if (!isSidebarOpen) {
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent
                side={isRTL ? 'left' : 'right'}
                className="bg-popover text-popover-foreground border border-border text-sm"
              >
                {label}
              </TooltipContent>
            </Tooltip>
          )
        }

        return content
      })}
    </div>
  )
}
SearchAndReports.displayName = 'SearchAndReports'

// ---------------------------------------------------------------------------
// ChatsSection
// ---------------------------------------------------------------------------

const ChatsSection = ({
  language,
  conversations,
  isLoading,
  currentPathname,
  onNavigate,
  chatBaseHref,
}: {
  language: 'en' | 'ar'
  conversations?: SidebarConversation[]
  isLoading?: boolean
  currentPathname?: string
  onNavigate?: (href: string) => void
  chatBaseHref: string
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <section className="flex flex-col gap-2">
      <button
        onClick={handleToggleCollapse}
        className="flex items-center gap-2 px-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-fast ease-standard cursor-pointer"
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand conversations' : 'Collapse conversations'}
      >
        <span className="flex-1 text-start">
          {language === 'ar' ? 'المحادثات الأخيرة' : 'Recent Conversations'}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 shrink-0 transition-transform duration-200',
            isCollapsed ? '-rotate-90' : 'rotate-0',
          )}
        />
      </button>

      {!isCollapsed && (
        <div className="flex flex-col gap-0.5">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}

          {!isLoading &&
            conversations?.map((chat) => {
              const title =
                language === 'ar' && chat.title_ar ? chat.title_ar : chat.title_en
              const isArabic = isArabicText(title)
              const href = `${chatBaseHref}/${chat.id}`
              const isActive =
                currentPathname === href || currentPathname?.startsWith(`${href}/`)

              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault()
                onNavigate?.(href)
              }

              return (
                <a
                  key={chat.id}
                  href={href}
                  onClick={handleClick}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-fast ease-standard group',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate text-xs" dir={isArabic ? 'rtl' : 'ltr'}>
                    {title}
                  </span>
                </a>
              )
            })}

          {!isLoading && (!conversations || conversations.length === 0) && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              {language === 'ar' ? 'لا توجد محادثات بعد' : 'No conversations yet'}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
ChatsSection.displayName = 'ChatsSection'

// ---------------------------------------------------------------------------
// UserProfile
// ---------------------------------------------------------------------------

const UserProfile = ({
  user,
  isLoading,
  onSignOut,
  isRTL,
}: {
  user?: SidebarUser | null
  isLoading?: boolean
  onSignOut?: () => void | Promise<void>
  isRTL: boolean
}) => {
  const { open, isMobile } = useSidebar()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const isSidebarOpen = open || isMobile

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await onSignOut?.()
    } catch (error) {
      console.error('[UserProfile]', 'Sign out error', error)
      setIsSigningOut(false)
    }
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center rounded-lg border border-border',
          isSidebarOpen ? 'justify-between p-3' : 'justify-center p-1',
        )}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          {isSidebarOpen && (
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          )}
        </div>
        {isSidebarOpen && <Skeleton className="h-8 w-8 rounded" />}
      </div>
    )
  }

  const displayName = user?.displayName ?? null
  const email = user?.email ?? null
  const avatarUrl = user?.avatarUrl ?? ''

  return (
    <div
      className={cn(
        'flex items-center rounded-lg border border-border bg-card',
        isSidebarOpen ? 'justify-between p-3' : 'justify-center p-1',
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={avatarUrl} alt="User avatar" />
          <AvatarFallback className="text-xs">
            {getUserInitials(displayName, email)}
          </AvatarFallback>
        </Avatar>

        {isSidebarOpen && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate text-foreground">
              {displayName ?? (isRTL ? 'مستخدم' : 'User')}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="text-xs text-muted-foreground truncate cursor-default"
                  dir="ltr"
                >
                  {email}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border border-border text-sm max-w-[280px] break-all">
                {email}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {isSidebarOpen && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 shrink-0 p-0 ms-2 cursor-pointer"
          onClick={handleSignOut}
          disabled={isSigningOut}
          title={isRTL ? 'تسجيل الخروج' : 'Sign out'}
        >
          <LogOut
            className={cn('h-4 w-4 text-muted-foreground', isRTL && 'rotate-180')}
          />
        </Button>
      )}
    </div>
  )
}
UserProfile.displayName = 'UserProfile'

// ---------------------------------------------------------------------------
// AppSidebar
// ---------------------------------------------------------------------------

const AppSidebar = ({
  language,
  isRTL,
  appName = 'Sentra',
  logo,
  user,
  isAuthLoading,
  onSignOut,
  onNavigate,
  currentPathname,
  conversations,
  isConversationsLoading,
  assistantHref = '/chat',
  analysisHref = '/analysis',
}: AppSidebarProps) => {
  const { open, isMobile } = useSidebar()
  const isSidebarOpen = open || isMobile

  const getActiveTab = (): ActiveTab => {
    if (currentPathname?.startsWith('/analysis')) return 'analysis'
    return 'assistant'
  }

  const [activeTab, setActiveTab] = useState<ActiveTab>(getActiveTab)

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab)
  }

  return (
    <Sidebar
      side={isRTL ? 'right' : 'left'}
      collapsible="icon"
      className={cn('border-border bg-card', isSidebarOpen ? 'px-3' : 'px-1', 'py-4')}
    >
      {/* Header: logo + toggle */}
      <SidebarHeader className="py-3 px-0 border-b border-border">
        <SidebarLogo
          appName={appName}
          logo={logo}
          onNavigate={onNavigate}
          assistantHref={assistantHref}
          language={language}
        />
      </SidebarHeader>

      {/* Content: tabs + assistant tools + chat list */}
      <SidebarContent
        className={cn(
          'pt-4 space-y-3',
          '[&::-webkit-scrollbar]:w-1.5',
          '[&::-webkit-scrollbar-track]:rounded-full',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:bg-border',
        )}
      >
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          language={language}
          isRTL={isRTL}
          onNavigate={onNavigate}
          assistantHref={assistantHref}
          analysisHref={analysisHref}
        />

        {activeTab === 'assistant' && (
          <>
            <SearchAndReports
              language={language}
              isRTL={isRTL}
              onNavigate={onNavigate}
              assistantHref={assistantHref}
            />
            {isSidebarOpen && (
              <div className="pt-2 border-t border-border">
                <ChatsSection
                  language={language}
                  conversations={conversations}
                  isLoading={isConversationsLoading}
                  currentPathname={currentPathname}
                  onNavigate={onNavigate}
                  chatBaseHref={assistantHref}
                />
              </div>
            )}
          </>
        )}
      </SidebarContent>

      {/* Footer: user profile */}
      <SidebarFooter className="px-0 pt-3 border-t border-border">
        <UserProfile
          user={user}
          isLoading={isAuthLoading}
          onSignOut={onSignOut}
          isRTL={isRTL}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

AppSidebar.displayName = 'AppSidebar'

export { AppSidebar }
export default AppSidebar