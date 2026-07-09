"use client";

import * as React from "react";
import { cn } from "@togo-framework/ui-core";
import { AppLayout, type AppLayoutProps } from "./AppLayout";

export interface AdminSubNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AdminLayoutProps extends Omit<AppLayoutProps, "children"> {
  /** Secondary section tabs rendered under the header (admin areas). */
  subNav: AdminSubNavItem[];
  activeSubNav?: string;
  onSubNavChange?: (key: string) => void;
  children: React.ReactNode;
}

/** AdminLayout — AppLayout plus a secondary sub-navigation tab bar under the header,
 * for admin areas (e.g. Users / Roles / Settings / Audit). Token-themed, RTL. */
export function AdminLayout({ subNav, activeSubNav, onSubNavChange, children, ...appProps }: AdminLayoutProps) {
  return (
    <AppLayout {...appProps}>
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-background px-4">
        {subNav.map((s) => {
          const active = s.key === activeSubNav;
          return (
            <button
              key={s.key}
              onClick={() => onSubNavChange?.(s.key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition",
                active ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.icon}{s.label}
            </button>
          );
        })}
      </div>
      <div className="p-6">{children}</div>
    </AppLayout>
  );
}
