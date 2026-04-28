"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Zap,
  Calendar,
  Wrench,
  Bot,
  Shield,
  Clock,
  BriefcaseBusiness,
  ArrowRight,
  Database,
  Cpu,
  CheckCircle,
} from "lucide-react";

/* ── Animation helpers ── */
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const stagger = (delayBase = 0, step = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren: delayBase } },
});

function Reveal({
  children,
  className,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.55, delay, ease: EASE } } }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ── Nav ── */
function Nav() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 5vw",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(14,17,23,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", color: "white" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#0f6175", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BriefcaseBusiness size={16} color="white" />
        </div>
        Autopilot
      </Link>

      <div className="hidden md:flex" style={{ gap: 24, alignItems: "center" }}>
        {[["#how", "How it works"], ["#features", "Features"], ["#modes", "Plans"]].map(([href, label]) => (
          <a key={href} href={href} style={{ fontSize: 13, color: "rgba(245,244,240,0.6)", fontWeight: 500, transition: "color .15s" }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#f5f4f0"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(245,244,240,0.6)"; }}
          >{label}</a>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/dashboard" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "rgba(245,244,240,0.7)", border: "1px solid rgba(255,255,255,0.12)", background: "transparent", transition: "all .15s" }}>
          Sign in
        </Link>
        <Link href="/dashboard" style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#0f6175", color: "white", border: "none", transition: "all .15s" }}>
          Get started →
        </Link>
      </div>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "100px 5vw 60px",
        position: "relative",
        overflow: "hidden",
        background: "#0e1117",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(15,97,117,0.25) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(244,184,96,0.06) 0%, transparent 60%)",
      }} />
      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Pill badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 6px",
            borderRadius: 20, border: "1px solid rgba(15,97,117,0.4)", background: "rgba(15,97,117,0.12)",
            fontSize: 12, fontWeight: 600, color: "#5bc8e0", marginBottom: 28, letterSpacing: "0.3px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#5bc8e0", animation: "pulse-dot 2s ease infinite" }} />
            AI-powered · Weather-aware · 24/7 active
          </div>

          <h1 style={{
            fontSize: "clamp(40px,7vw,80px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05,
            marginBottom: 24,
            background: "linear-gradient(160deg,#ffffff 0%,rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Your home runs<br />on autopilot.
          </h1>

          <p style={{ fontSize: "clamp(16px,2vw,20px)", color: "rgba(245,244,240,0.6)", maxWidth: 560, lineHeight: 1.65, marginBottom: 40, margin: "0 auto 40px" }}>
            Autopilot manages your household maintenance — scheduling, vendors, approvals — so you never forget a filter, miss a tune-up, or overpay a contractor again.
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            <Link href="/dashboard" style={{
              padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600, background: "#f4b860",
              color: "#1a1000", border: "none", display: "inline-flex", alignItems: "center", gap: 8,
              transition: "all .2s", boxShadow: "0 4px 20px rgba(244,184,96,0.25)",
            }}>
              <Zap size={16} />
              Start for free
            </Link>
            <a href="#how" style={{
              padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, background: "#0f6175",
              color: "white", border: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "all .2s",
            }}>
              See how it works
            </a>
          </div>

          <p style={{ fontSize: 12, color: "rgba(245,244,240,0.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <strong style={{ color: "rgba(245,244,240,0.8)" }}>2,400+</strong> households ·
            Setup in under 2 minutes · No credit card needed
          </p>
        </motion.div>

        {/* App mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          style={{ marginTop: 56, maxWidth: 900, margin: "56px auto 0", position: "relative" }}
        >
          <AppMockup />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
            background: "linear-gradient(transparent, #0e1117)",
            borderRadius: "0 0 12px 12px", pointerEvents: "none",
          }} />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Minimal app mockup ── */
function AppMockup() {
  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Browser chrome */}
      <div style={{
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px 12px 0 0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8,
      }}>
        {[["#ef4444"], ["#f59e0b"], ["#22c55e"]].map(([c], i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 5, height: 22, margin: "0 8px", display: "flex", alignItems: "center", padding: "0 10px" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>app.autopilothome.com</span>
        </div>
      </div>
      {/* App frame */}
      <div style={{
        width: "100%", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none",
        borderRadius: "0 0 12px 12px", overflow: "hidden", background: "#f6f5f1", height: 420,
        display: "flex", position: "relative",
      }}>
        {/* Mock glow */}
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,97,117,0.12) 0%, transparent 70%)", top: -50, right: -50, pointerEvents: "none" }} />
        {/* Sidebar */}
        <div style={{ width: 180, background: "#fffefa", borderRight: "1px solid #d9d5ca", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 8px 12px", borderBottom: "1px solid #d9d5ca", marginBottom: 4 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "#0f6175" }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#1b1b18" }}>Autopilot</div>
              <div style={{ fontSize: 9, color: "#66635c" }}>Household OS</div>
            </div>
          </div>
          {[["Dashboard", true], ["Tasks", false], ["Calendar", false], ["Assistant", false], ["Settings", false]].map(([label, active]) => (
            <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", borderRadius: 6, fontSize: 11, background: active ? "#eeece5" : "transparent", color: active ? "#1b1b18" : "#66635c", fontWeight: active ? 600 : 400 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: active ? "#0f6175" : "#d9d5ca", opacity: active ? 0.8 : 1 }} />
              {label}
            </div>
          ))}
        </div>
        {/* Main area */}
        <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #d9d5ca" }}>
            <div>
              <div style={{ fontSize: 9, color: "#66635c", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Detroit household</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1b1b18" }}>Dashboard</div>
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid #d9d5ca", background: "#fffefa", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid #d9d5ca", position: "relative" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f4b860", position: "absolute", top: -2, right: -2 }} />
                </div>
              </div>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0f6175", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white" }}>DH</div>
            </div>
          </div>
          {/* Stat row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[["24", "Tasks", "#0f6175"], ["14", "Autopilot", "#15803d"], ["2", "Jobs", "#a16207"], ["38", "Signals", "#1b1b18"]].map(([v, l, c]) => (
              <div key={l} style={{ background: "#fffefa", border: "1px solid #d9d5ca", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: c, lineHeight: 1, marginBottom: 3 }}>{v}</div>
                <div style={{ fontSize: 9, color: "#66635c" }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Task rows */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10, flex: 1, overflow: "hidden" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: "#1b1b18" }}>Upcoming tasks</div>
              {[["Replace filter: HVAC", "AUTOPILOT", "May 2", "#cffafe", "#0f6175"], ["Test smoke alarms", "NOTIFY", "May 3", "#eeece5", "#66635c"], ["Flush water heater", "GUIDE", "May 4", "#fef9c3", "#a16207"], ["Clean dryer vent", "AUTOPILOT", "May 5", "#cffafe", "#0f6175"]].map(([title, mode, due, bg, c]) => (
                <div key={title as string} style={{ background: "#fffefa", border: "1px solid #d9d5ca", borderRadius: 7, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: "#1b1b18" }}>{title}</div>
                    <div style={{ fontSize: 8, color: "#66635c", marginTop: 1 }}>Due {due}</div>
                  </div>
                  <span style={{ padding: "2px 5px", borderRadius: 4, fontSize: 8, fontWeight: 600, background: bg, color: c }}>{mode}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fffefa", border: "1px solid #d9d5ca", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 7, color: "#1b1b18" }}>Active jobs</div>
              {[["HVAC", "Scheduled", "#dcfce7", "#15803d"], ["Handyman", "Approval", "#fef9c3", "#a16207"]].map(([t, s, bg, c]) => (
                <div key={t as string} style={{ border: "1px solid #d9d5ca", borderRadius: 6, padding: "7px 8px", marginBottom: 5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#0f6175" }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: "#1b1b18" }}>{t}</span>
                    </div>
                    <span style={{ padding: "1px 4px", borderRadius: 3, fontSize: 8, fontWeight: 600, background: bg, color: c }}>{s}</span>
                  </div>
                  <div style={{ fontSize: 8, color: "#66635c" }}>Alex Rivera · Tomorrow</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── How it works ── */
function HowItWorks() {
  const steps = [
    { n: "1", icon: Database, color: "#5bc8e0", bg: "rgba(15,97,117,0.2)", title: "Data layer", desc: "Weather, property records, appliance age, local service coverage — all pulled automatically and kept current." },
    { n: "2", icon: Zap, color: "#f4b860", bg: "rgba(244,184,96,0.12)", title: "Intelligence layer", desc: "Memory retrieval, preference learning, and behavioral signals shape every scheduling decision and cost estimate." },
    { n: "3", icon: Shield, color: "#4ade80", bg: "rgba(34,197,94,0.1)", title: "Decision layer", desc: "Autopilot evaluates due dates, your approval limits, mode preferences, and risk levels before taking any action." },
    { n: "4", icon: Wrench, color: "#a78bfa", bg: "rgba(139,92,246,0.15)", title: "Execution layer", desc: "Real jobs booked with vetted technicians. Payments processed. Feedback captured. Your home record updated." },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how" style={{ padding: "96px 5vw", background: "#0a1520" }}>
      <Reveal style={{ textAlign: "center", marginBottom: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0f6175", marginBottom: 12 }}>How it works</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, color: "white", marginBottom: 16 }}>Four layers. Zero effort.</h2>
        <p style={{ fontSize: 16, color: "rgba(245,244,240,0.6)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
          Autopilot combines home data, AI reasoning, vetted vendors, and your preferences into a fully managed maintenance system.
        </p>
      </Reveal>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger(0.15, 0.12)}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20, marginTop: 52 }}
      >
        {steps.map((s) => (
          <motion.div
            key={s.n}
            variants={fadeUp}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, padding: 28, position: "relative", overflow: "hidden",
              transition: "border-color .2s, transform .2s",
            }}
            whileHover={{ y: -4, borderColor: "rgba(15,97,117,0.45)" }}
          >
            <div style={{ fontSize: 56, fontWeight: 900, color: "rgba(255,255,255,0.04)", position: "absolute", top: 10, right: 16, lineHeight: 1, letterSpacing: "-3px" }}>{s.n}</div>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.3px", color: "white" }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: "rgba(245,244,240,0.6)", lineHeight: 1.6 }}>{s.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Features ── */
function Features() {
  const features = [
    { icon: Calendar, title: "Smart scheduling", desc: "Tasks timed around weather, seasons, and your routine. Rain coming? Outdoor work moves automatically." },
    { icon: Wrench, title: "Vetted vendors", desc: "Licensed, background-checked technicians booked in your area — only when work requires it." },
    { icon: Bot, title: "AI assistant", desc: "Ask anything about your home. Context-aware answers from your household's history — not generic advice." },
    { icon: Shield, title: "Approval controls", desc: "Set an auto-approval limit. Jobs under your threshold happen without friction. Over it — you review first." },
    { icon: Zap, title: "Learning signals", desc: "Every approval, deferral, and preference shapes future decisions. Autopilot gets smarter the longer you use it." },
    { icon: Clock, title: "Full home history", desc: "Every task completed, every job booked, every cost recorded. Your home's maintenance history, always at hand." },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" style={{ padding: "96px 5vw", background: "linear-gradient(180deg,#0e1117 0%,#0a1520 100%)" }}>
      <Reveal style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0f6175", marginBottom: 12 }}>Features</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, color: "white", marginBottom: 12 }}>Everything your home needs.</h2>
        <p style={{ fontSize: 16, color: "rgba(245,244,240,0.6)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
          Built for homeowners who want things handled — without losing visibility or control.
        </p>
      </Reveal>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger(0.1, 0.08)}
        style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 2, marginTop: 52, borderRadius: 16, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            style={{ padding: 28, background: "rgba(255,255,255,0.06)", transition: "background .2s", cursor: "default" }}
            whileHover={{ background: "rgba(255,255,255,0.09)" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(15,97,117,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <f.icon size={18} color="#5bc8e0" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.2px", color: "white" }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: "rgba(245,244,240,0.6)", lineHeight: 1.6 }}>{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Modes ── */
function Modes() {
  const modes = [
    { badge: "🔔 NOTIFY", badgeBg: "rgba(255,255,255,0.08)", badgeColor: "rgba(255,255,255,0.6)", title: "Mostly notify me", desc: "You get alerts and recommendations. Every action requires your sign-off. Full control, helpful reminders.", highlight: false },
    { badge: "🧭 GUIDE — Popular", badgeBg: "rgba(244,184,96,0.15)", badgeColor: "#f4b860", title: "Guide me through it", desc: "Step-by-step recommendations with your approval on key steps. Smart defaults, human decisions on the important stuff.", highlight: true },
    { badge: "✈️ AUTOPILOT", badgeBg: "rgba(15,97,117,0.2)", badgeColor: "#5bc8e0", title: "Autopilot when safe", desc: "Routine, low-risk tasks are handled automatically. You review high-cost or non-standard work before it proceeds.", highlight: false },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="modes" style={{ padding: "96px 5vw", background: "#0a1520" }}>
      <Reveal style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0f6175", marginBottom: 12 }}>Automation modes</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, color: "white", marginBottom: 12 }}>Your home, your control level.</h2>
        <p style={{ fontSize: 16, color: "rgba(245,244,240,0.6)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
          Choose how much Autopilot handles. Change it any time from settings.
        </p>
      </Reveal>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger(0.1, 0.12)}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginTop: 52 }}
      >
        {modes.map((m) => (
          <motion.div
            key={m.title}
            variants={fadeUp}
            style={{
              borderRadius: 14, padding: 28,
              border: m.highlight ? "1px solid rgba(15,97,117,0.5)" : "1px solid rgba(255,255,255,0.1)",
              background: m.highlight ? "rgba(15,97,117,0.1)" : "rgba(255,255,255,0.06)",
              transition: "transform .2s",
            }}
            whileHover={{ y: -4 }}
          >
            <div style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", marginBottom: 14, background: m.badgeBg, color: m.badgeColor }}>{m.badge}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.3px", color: "white" }}>{m.title}</h3>
            <p style={{ fontSize: 13, color: "rgba(245,244,240,0.6)", lineHeight: 1.6 }}>{m.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Social proof ── */
function SocialProof() {
  const stats = [
    { value: "2,400+", label: "Active households", color: "white" },
    { value: "$840",   label: "Avg. annual savings", color: "#5bc8e0" },
    { value: "98%",    label: "On-time job completion", color: "white" },
    { value: "4.9★",   label: "Average rating", color: "#f4b860" },
  ];
  const testimonials = [
    { q: "I haven't thought about my HVAC filter in two years. It just gets replaced. That alone is worth it.", author: "Maria K.", sub: "Single family, Chicago", initials: "MK" },
    { q: "The approval flow is perfect. Under $200 it just happens. Over that I get a prompt. I feel totally in control.", author: "James R.", sub: "Townhome, Detroit", initials: "JR" },
    { q: "As a landlord with 4 properties, this is the only way I could possibly keep up with everything.", author: "Sandra L.", sub: "Multi-family, Atlanta", initials: "SL" },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section style={{ padding: "96px 5vw", background: "#0e1117", textAlign: "center" }}>
      <Reveal>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0f6175", marginBottom: 40 }}>Why homeowners love it</div>
      </Reveal>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger(0, 0.1)}
        style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", marginBottom: 64 }}
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <div style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, letterSpacing: "-2px", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "rgba(245,244,240,0.6)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={stagger(0.3, 0.1)}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}
      >
        {testimonials.map((t) => (
          <motion.div key={t.author} variants={fadeUp} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 22, textAlign: "left" }}>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(245,244,240,0.6)", marginBottom: 14, fontStyle: "italic" }}>&ldquo;{t.q}&rdquo;</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0f6175", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>{t.initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{t.author}</div>
                <div style={{ fontSize: 11, color: "rgba(245,244,240,0.5)" }}>{t.sub}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  return (
    <section style={{
      padding: "100px 5vw", textAlign: "center", position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg,rgba(15,97,117,0.3) 0%,rgba(10,21,32,0.9) 60%),#0e1117",
    }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(15,97,117,0.2) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#0f6175", marginBottom: 16 }}>Get started</div>
          <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16, color: "white", lineHeight: 1.1 }}>
            Ready to put your home<br />on autopilot?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(245,244,240,0.6)", maxWidth: 440, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Setup takes under 2 minutes. No credit card required. Cancel any time.
          </p>
          <Link href="/dashboard" style={{
            padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600, background: "#f4b860",
            color: "#1a1000", border: "none", display: "inline-flex", alignItems: "center", gap: 8,
            transition: "all .2s",
          }}>
            <Zap size={16} />
            Create your household plan
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{
      background: "#080c12", borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "40px 5vw", display: "flex", justifyContent: "space-between",
      alignItems: "center", flexWrap: "wrap", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "white" }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: "#0f6175", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BriefcaseBusiness size={13} color="white" />
        </div>
        Autopilot
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {[["#how", "How it works"], ["#features", "Features"], ["/dashboard", "Open app"], ["#", "Privacy"], ["#", "Terms"]].map(([href, label]) => (
          <a key={label} href={href} style={{ fontSize: 12, color: "rgba(245,244,240,0.5)", transition: "color .15s" }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "rgba(245,244,240,0.9)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(245,244,240,0.5)"; }}
          >{label}</a>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2025 Autopilot. All rights reserved.</div>
    </footer>
  );
}

/* ── Root export ── */
export function LandingPage() {
  return (
    <div style={{ background: "#0e1117", color: "#f5f4f0", fontFamily: "-apple-system,'Inter',BlinkMacSystemFont,'Segoe UI',sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Modes />
        <SocialProof />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
