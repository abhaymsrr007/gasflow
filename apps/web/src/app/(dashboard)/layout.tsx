
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Building2,
} from "lucide-react";
import { navigationConfig } from "../../config/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  permissions?: string[];
  agencyName?: string;
  subscriptionStatus?: string;
  onSignOut?: () => void;
}

export default function DashboardLayout({
  children,
  permissions = [],
  agencyName = "Your Agency",
  subscriptionStatus = "Trial Active",
  onSignOut,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Permission-based navigation
  const visibleGroups = navigationConfig
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          permissions.length === 0 ||
          permissions.includes(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);

  console.log("Visible Groups:", JSON.stringify(visibleGroups)); // Debugging line
  console.log("Current permissions:", JSON.stringify(permissions)); // Debugging line

  // Active route detection
  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-in-out md:hidden ${mobileOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
          }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white shadow-sm
          transition-[width,transform] duration-300 ease-in-out
          md:static md:z-20 md:shadow-none
          ${collapsed
            ? "w-[72px]"
            : "w-[260px]"
          }
          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Sidebar Header */}
        <div
          className={`relative flex h-16 shrink-0 items-center border-b border-slate-100
            transition-[padding] duration-300 ease-in-out
            ${collapsed
              ? "justify-center px-2"
              : "justify-between px-5"
            }`}
        >
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-xl font-extrabold tracking-tight text-blue-700"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              G
            </div>

            <span
              className={`overflow-hidden transition-[width,opacity] duration-200 ease-in-out ${collapsed
                ? "w-0 opacity-0"
                : "w-auto opacity-100"
                }`}
            >
              GASFlow
            </span>
          </Link>

          {/* Desktop Collapse / Expand Button */}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className={`hidden rounded-lg p-2 text-slate-500
              transition-[background-color,color,transform] duration-200 ease-in-out
              hover:bg-slate-100 hover:text-slate-900
              md:flex
              ${collapsed
                ? "absolute -right-3 top-5 z-30 border border-slate-200 bg-white shadow-sm"
                : ""
              }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          <div className="space-y-6">
            {visibleGroups.map((group) => (
              <div key={group.title}>
                {/* Group Title */}
                <div
                  className={`overflow-hidden whitespace-nowrap transition-[height,opacity,margin] duration-200 ease-in-out ${collapsed
                    ? "mb-0 h-0 opacity-0"
                    : "mb-2 h-4 opacity-100"
                    }`}
                >
                  {!collapsed && (
                    <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {group.title}
                    </h3>
                  )}
                </div>

                {/* Collapsed Group Separator */}
                {collapsed && (
                  <div className="mb-3 border-t border-slate-100" />
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center rounded-lg py-2.5 text-sm font-medium
                          transition-[background-color,color,padding] duration-200 ease-in-out
                          ${collapsed
                            ? "justify-center px-2"
                            : "gap-3 px-3"
                          }
                          ${active
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-colors duration-200 ease-in-out ${active
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-600"
                            }`}
                        />

                        <span
                          className={`overflow-hidden whitespace-nowrap transition-[width,opacity] duration-200 ease-in-out ${collapsed
                            ? "w-0 opacity-0"
                            : "w-auto opacity-100"
                            }`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={onSignOut}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-red-600
              transition-[background-color,color,padding] duration-200 ease-in-out
              hover:bg-red-50
              ${collapsed
                ? "justify-center px-2"
                : "gap-3 px-3"
              }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />

            <span
              className={`overflow-hidden whitespace-nowrap transition-[width,opacity] duration-200 ease-in-out ${collapsed
                ? "w-0 opacity-0"
                : "w-auto opacity-100"
                }`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 transition-colors duration-200 hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-slate-500" />

              <span className="truncate rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                {agencyName}
              </span>
            </div>
          </div>

          {/* Subscription Status */}
          <span className="ml-3 shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            {subscriptionStatus}
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
