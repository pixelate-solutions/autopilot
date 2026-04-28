"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  CheckSquare,
  CalendarDays,
  Bot,
  Settings,
  Shield,
  Wrench,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CUSTOMER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

const OWNER_EXTRA = [
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/technician", label: "Technician", icon: Wrench },
];

export function AppShell({
  children,
  section = "Dashboard",
}: {
  children: React.ReactNode;
  section?: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<"customer" | "owner">("customer");

  useEffect(() => {
    const c = localStorage.getItem("ap_sidebar_collapsed");
    if (c !== null) setCollapsed(c === "true");
    const r = localStorage.getItem("ap_role") as "customer" | "owner" | null;
    if (r) setRole(r);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem("ap_sidebar_collapsed", String(!v));
      return !v;
    });
  };

  const toggleRole = () => {
    setRole((v) => {
      const next = v === "customer" ? "owner" : "customer";
      localStorage.setItem("ap_role", next);
      return next;
    });
  };

  const nav =
    role === "owner"
      ? [...CUSTOMER_NAV.slice(0, -1), ...OWNER_EXTRA, CUSTOMER_NAV[CUSTOMER_NAV.length - 1]]
      : CUSTOMER_NAV;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 224 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col overflow-hidden"
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 border-b shrink-0"
          style={{ padding: "14px 12px", borderColor: "var(--border)", minHeight: 60, overflow: "hidden" }}
        >
          <div
            className="flex items-center justify-center shrink-0 rounded-lg"
            style={{ width: 32, height: 32, background: "var(--primary)" }}
          >
            <BriefcaseBusiness size={15} color="var(--primary-foreground)" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                <div className="font-bold text-sm" style={{ letterSpacing: "-0.3px" }}>
                  Autopilot
                </div>
                <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  Household OS
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: "8px" }}>
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn("flex items-center rounded-lg text-sm transition-colors mb-0.5")}
                style={{
                  padding: "9px 10px",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? "var(--muted)" : "transparent",
                  color: active ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: active ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <item.icon size={16} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "8px", borderTop: "1px solid var(--border)" }}>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={toggleRole}
                title="Toggle account role (demo)"
                className="flex items-center gap-2 rounded-lg mb-1.5 w-full"
                style={{
                  padding: "9px 10px",
                  background: "var(--muted)",
                  border: "none",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0 rounded-full text-[10px] font-bold"
                  style={{ width: 26, height: 26, background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  DH
                </div>
                <div style={{ overflow: "hidden", whiteSpace: "nowrap", textAlign: "left" }}>
                  <div className="text-xs font-semibold truncate">Detroit household</div>
                  <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {role === "owner" ? "Owner · Active plan" : "48226 · Active plan"}
                  </div>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex items-center justify-center w-full rounded-lg transition-colors hover:bg-muted"
            style={{ padding: "8px 10px", color: "var(--muted-foreground)", border: "none", background: "transparent", cursor: "pointer" }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </motion.aside>

      {/* Main — desktop */}
      <motion.main
        animate={{ paddingLeft: collapsed ? 56 : 224 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 min-w-0 hidden lg:block"
      >
        <Topbar section={section} role={role} />
        <div style={{ padding: "20px 22px", animation: "fadeIn 0.2s ease" }}>{children}</div>
      </motion.main>

      {/* Main — mobile */}
      <div className="flex-1 min-w-0 lg:hidden">
        <Topbar section={section} role={role} />
        <div style={{ padding: "16px", paddingBottom: 80, animation: "fadeIn 0.2s ease" }}>{children}</div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex"
        style={{ background: "var(--card)", borderTop: "1px solid var(--border)", padding: "8px 0 10px" }}
      >
        {CUSTOMER_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.75"
              style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
            >
              <item.icon size={20} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Topbar({ section, role }: { section: string; role: "customer" | "owner" }) {
  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3"
      style={{
        background: "rgba(246,245,241,0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
        padding: "12px 22px",
      }}
    >
      <div className="flex-1">
        <div
          className="text-[10px] font-semibold uppercase"
          style={{ letterSpacing: "0.6px", color: "var(--muted-foreground)", marginBottom: 1 }}
        >
          Detroit household
        </div>
        <h1 className="text-[17px] font-bold" style={{ letterSpacing: "-0.4px", lineHeight: 1.2 }}>
          {section}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {role === "owner" && (
          <span
            className="inline-flex items-center rounded-md border text-[11px] font-medium px-2 py-0.5"
            style={{ background: "#fef9c3", color: "#a16207", borderColor: "#fef08a" }}
          >
            Owner
          </span>
        )}
        <button
          className="relative flex items-center justify-center rounded-lg border"
          style={{ width: 34, height: 34, background: "var(--card)", borderColor: "var(--border)", cursor: "pointer" }}
        >
          <Bell size={15} color="var(--muted-foreground)" />
          <span
            className="absolute rounded-full border-[1.5px]"
            style={{ top: 7, right: 7, width: 6, height: 6, background: "var(--accent)", borderColor: "var(--card)" }}
          />
        </button>
        <div
          className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
          style={{ width: 34, height: 34, background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          DH
        </div>
      </div>
    </div>
  );
}
