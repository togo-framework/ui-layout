import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { LayoutDashboard, AlertTriangle, Users, FileText, Shield, User, Settings, KeyRound, History } from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Badge, StatCard } from "@togo-framework/ui-core";

const meta: Meta = {
  title: "Layout/Overview",
  parameters: { layout: "fullscreen", fullBleed: true, docs: { story: { inline: false, height: "640px" } } },
};
export default meta;
type Story = StoryObj;

const brand = { name: "Sentra Hub", subtitle: "Intelligence", icon: <Shield className="h-4 w-4" /> };
const nav = [
  { label: "Intelligence", items: [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, active: true },
    { key: "events", label: "Events", icon: <AlertTriangle className="h-4 w-4" />, badge: <Badge variant="secondary" className="text-2xs">14</Badge> },
    { key: "entities", label: "Entities", icon: <Users className="h-4 w-4" /> },
    { key: "narratives", label: "Narratives", icon: <FileText className="h-4 w-4" /> },
  ]},
];
const footer = { items: [{ key: "profile", label: "Profile", icon: <User className="h-4 w-4" /> }, { key: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> }] };

export const AppShell: Story = {
  name: "App Layout",
  render: () => (
    <AppLayout brand={brand} nav={nav} footer={footer} headerTitle="Dashboard"
      headerEnd={<Badge>dev@togo.local</Badge>}>
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Open events" value="14" />
        <StatCard icon={<Users className="h-4 w-4" />} label="Entities" value="1,284" />
        <StatCard icon={<FileText className="h-4 w-4" />} label="Narratives" value="37" />
      </div>
    </AppLayout>
  ),
};

export const AppShellRTL: Story = {
  name: "App Layout — Arabic / RTL",
  render: () => (
    <AppLayout language="ar" brand={{ ...brand, name: "مركز سنترا" }}
      nav={[{ label: "الاستخبارات", items: nav[0].items.map((i, idx) => ({ ...i, label: ["لوحة", "الأحداث", "الكيانات", "الروايات"][idx] })) }]}
      footer={{ items: [{ key: "profile", label: "الملف", icon: <User className="h-4 w-4" /> }] }}
      headerTitle="لوحة التحكم">
      <p className="p-6 text-sm text-muted-foreground">منطقة المحتوى الرئيسية.</p>
    </AppLayout>
  ),
};

const adminNav = [{ label: "Admin", items: [
  { key: "users", label: "Users", icon: <Users className="h-4 w-4" />, active: true },
  { key: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
]}];
const subNav = [
  { key: "members", label: "Members", icon: <Users className="h-4 w-4" /> },
  { key: "roles", label: "Roles", icon: <Shield className="h-4 w-4" /> },
  { key: "keys", label: "API Keys", icon: <KeyRound className="h-4 w-4" /> },
  { key: "audit", label: "Audit log", icon: <History className="h-4 w-4" /> },
];

export const Admin: Story = {
  name: "Admin Layout",
  render: () => {
    const [tab, setTab] = useState("members");
    return (
      <AdminLayout brand={{ name: "Admin", icon: <Settings className="h-4 w-4" /> }} nav={adminNav}
        headerTitle="Administration" subNav={subNav} activeSubNav={tab} onSubNavChange={setTab}>
        <h2 className="mb-2 text-lg font-semibold capitalize">{tab}</h2>
        <p className="text-sm text-muted-foreground">Content for the “{tab}” admin section.</p>
      </AdminLayout>
    );
  },
};
