"use client";

import * as React from "react";
import {
  cn,
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarInset, SidebarTrigger,
} from "@togo-framework/ui-core";

export interface AppNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
}
export interface AppNavGroup {
  label?: string;
  items: AppNavItem[];
}
export interface AppBrand {
  name: string;
  subtitle?: string;
  icon?: React.ReactNode;
  primary?: string;
}

export interface AppHeaderProps {
  /** Renders a sidebar collapse trigger at the start. */
  withSidebarTrigger?: boolean;
  title?: React.ReactNode;
  /** Center slot (e.g. a search box). */
  center?: React.ReactNode;
  /** End slot (e.g. actions, user menu, realtime dot). */
  end?: React.ReactNode;
  className?: string;
}

/** AppHeader — a product-agnostic top bar: optional sidebar trigger + title (start),
 * an optional center slot, and an end slot (actions / user menu). Token-themed, RTL. */
export function AppHeader({ withSidebarTrigger, title, center, end, className }: AppHeaderProps) {
  return (
    <header className={cn("flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur", className)}>
      <div className="flex min-w-0 items-center gap-2">
        {withSidebarTrigger && <SidebarTrigger />}
        {title && <div className="truncate font-semibold">{title}</div>}
      </div>
      {center && <div className="mx-auto hidden max-w-md flex-1 md:block">{center}</div>}
      {end && <div className="ms-auto flex items-center gap-2">{end}</div>}
    </header>
  );
}

export interface AppLayoutProps {
  brand: AppBrand;
  nav: AppNavGroup[];
  onNavigate?: (key: string) => void;
  /** Footer nav (e.g. Profile / Settings). */
  footer?: AppNavGroup;
  /** Header slots. */
  headerTitle?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerEnd?: React.ReactNode;
  /** Optional floating slot inside the content (e.g. a copilot launcher). */
  assistant?: React.ReactNode;
  language?: "en" | "ar";
  defaultSidebarOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

function NavGroup({ group, onNavigate }: { group: AppNavGroup; onNavigate?: (k: string) => void }) {
  return (
    <SidebarGroup>
      {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
      <SidebarMenu>
        {group.items.map((item) => (
          <SidebarMenuItem key={item.key}>
            <SidebarMenuButton isActive={item.active} tooltip={item.label} onClick={() => onNavigate?.(item.key)}>
              {item.icon}
              <span className="truncate">{item.label}</span>
              {item.badge != null && <span className="ms-auto">{item.badge}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/** AppLayout — the full app shell: a collapsible sidebar (brand + nav groups + footer)
 * + a top header + content area. Built on the kit Sidebar primitives. Responsive
 * (off-canvas on mobile), RTL-aware, token-themed. */
export function AppLayout({
  brand, nav, onNavigate, footer, headerTitle, headerCenter, headerEnd, assistant,
  language = "en", defaultSidebarOpen = true, children, className,
}: AppLayoutProps) {
  const primary = brand.primary || "hsl(var(--primary))";
  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen} dir={language === "ar" ? "rtl" : "ltr"}>
      <Sidebar side={language === "ar" ? "right" : "left"}>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: primary }}>
              {brand.icon}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-sidebar-foreground">{brand.name}</span>
              {brand.subtitle && <span className="block truncate text-[11px] text-sidebar-foreground/60">{brand.subtitle}</span>}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {nav.map((g, i) => <NavGroup key={i} group={g} onNavigate={onNavigate} />)}
        </SidebarContent>
        {footer && (
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              {footer.items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton isActive={item.active} tooltip={item.label} onClick={() => onNavigate?.(item.key)}>
                    {item.icon}<span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset className={className}>
        <AppHeader withSidebarTrigger title={headerTitle} center={headerCenter} end={headerEnd} />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
        {assistant}
      </SidebarInset>
    </SidebarProvider>
  );
}
