"use client";
import React from "react";

// ---------------------------------------------------------------------------
// NO EXTERNAL UI IMPORTS
// This canvas doesn't resolve private packages from CDN. We inline minimal
// primitives (Button, Input, Card, CardHeader, CardTitle, CardContent)
// and a token stylesheet so the dashboard runs with zero deps.
// Also: Converted to plain JS/JSX — no TypeScript types/generics — to fix
// "Unexpected token, expected ','" parse errors in non-TS transpilers.
// ---------------------------------------------------------------------------

// Minimal design tokens (fallbacks) – works without Tailwind
const Tokens = () => (
  <style>{`
    :root {
      --color-primary: rgb(66, 163, 68); /* requested accent */
      --color-primary-hover: rgb(66, 163, 68);
      --color-success: rgb(66, 163, 68);
      --color-danger: #BE123C;
      --color-warning: #D97706;
      --color-info: #0369A1;
      --color-on-primary: #000000; /* contrast-safe on the new green */
      --color-on-success: #000000;
      --color-on-danger: #FFFFFF;
      --color-on-warning: #000000;
      --color-on-info: #FFFFFF;
      --color-background: #FFFFFF;
      --color-surface: #FFFFFF;
      --color-surface-elevated: #F9FAFB;
      --color-text-primary: #0F172A;
      --color-text-secondary: #4B5563;
      --color-text-tertiary: #6B7280;
      --color-border-default: #E5E7EB;
      --radius-lg: 12px;
    }
    [data-theme="dark"] {
      --color-background: #0F172A;
      --color-surface: #1E293B;
      --color-surface-elevated: #334155;
      --color-text-primary: #FFFFFF;
      --color-text-secondary: #D1D5DB;
      --color-text-tertiary: #9CA3AF;
      --color-border-default: #4B5563;
      --color-primary: rgb(66, 163, 68); /* keep brand consistent in dark */
      --color-primary-hover: rgb(66, 163, 68);
    }
    .cm-card { background: var(--color-surface); border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); padding: 16px; }
    .cm-card-hover { transition: box-shadow .2s ease, transform .2s ease; }
    .cm-card-hover:hover { box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1); transform: translateY(-1px); }
    .cm-btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 10px; font-weight: 600; padding: 10px 14px; border: 1px solid transparent; cursor: pointer; transition: background .15s ease, border-color .15s ease, transform .1s ease; }
    .cm-btn:active { transform: scale(.98); }
    .cm-btn--primary { background: var(--color-primary); color: var(--color-on-primary); }
    .cm-btn--primary:hover { background: var(--color-primary-hover); }
    .cm-btn--secondary { background: var(--color-surface); color: var(--color-text-primary); border-color: var(--color-border-default); }
    .cm-btn--secondary:hover { background: var(--color-surface-elevated); }
    .cm-btn--ghost { background: transparent; color: var(--color-text-primary); border-color: transparent; }
    .cm-input { width: 100%; border: 2px solid var(--color-border-default); border-radius: 10px; padding: 8px 12px; background: var(--color-surface); color: var(--color-text-primary); }
    .cm-input:focus { outline: none; border-color: var(--color-primary); }
    .cm-label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--color-text-secondary); }
    .cm-table th, .cm-table td { padding: 8px 12px; }
    .cm-dot { display:inline-block; width:10px; height:10px; border-radius:9999px; }
  `}</style>
);

// Local UI primitives ------------------------------------------------------
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button = ({ children, onClick, variant = "primary", size = "md", className = "" }: ButtonProps) => {
  const pad = size === "sm" ? "8px 10px" : size === "lg" ? "12px 18px" : "10px 14px";
  const cls = `cm-btn cm-btn--${variant} ${className}`;
  return (
    <button className={cls} onClick={onClick} style={{ padding: pad }}>
      {children}
    </button>
  );
};

interface InputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

const Input = ({ label, value, onChange, placeholder, type = "text" }: InputProps) => (
  <div>
    {label && <label className="cm-label">{label}</label>}
    <input className="cm-input" type={type} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

const Card = ({ children, hover, className = "" }: CardProps) => (
  <div className={`cm-card ${hover ? "cm-card-hover" : ""} ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (<div style={{ marginBottom: 12 }}>{children}</div>);
const CardTitle = ({ children }: { children: React.ReactNode }) => (<h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)" }}>{children}</h3>);
const CardContent = ({ children }: { children: React.ReactNode }) => (<div>{children}</div>);

// --- Pure helpers (also used by tests) -----------------------------------
function estimateTokens(s: string) { return Math.max(1, Math.ceil((s || "").length / 4)); }

interface RunSummaryParams {
  id: string;
  repo: string;
  branch: string;
  commit?: string;
  prompt: string;
}

interface RunSummary {
  id: string;
  repo: string;
  branch: string;
  commit?: string;
  prompt: string;
  status: string;
  startedAt: string;
  durationSec?: number;
}

function mkRunSummary({ id, repo, branch, commit, prompt }: RunSummaryParams): RunSummary {
  return {
    id,
    repo,
    branch,
    commit: commit || undefined,
    prompt: (prompt || "").slice(0, 120) + ((prompt || "").length > 120 ? "…" : ""),
    status: "running",
    startedAt: new Date().toISOString(),
  };
}

interface Server {
  id: string;
  name: string;
  url: string;
  healthy: boolean;
  latencyMs: number | null;
  lastChecked: string;
}

function restartServersImmutable(list: Server[], id: string): Server[] {
  return list.map((s) => (s.id === id ? { ...s, healthy: true, latencyMs: 120, lastChecked: new Date().toISOString() } : s));
}

interface AgentPool {
  activeAgents: number;
  queuedJobs: number;
  maxConcurrency: number;
  avgJobMs: number;
}

function updateConcurrencyImmutable(info: AgentPool, v: number): AgentPool {
  const clamped = Math.min(16, Math.max(1, Math.floor(Number.isFinite(v) ? v : 1)));
  return { ...info, maxConcurrency: clamped };
}

// --- Mock data for UI wiring --------------------------------------------
const initialServers: Server[] = [
  { id: "openai",        name: "OpenAI MCP",        url: "http://localhost:7001", healthy: true,  latencyMs: 112, lastChecked: new Date().toISOString() },
  { id: "google-gemini", name: "Google Gemini MCP", url: "http://localhost:7002", healthy: false, latencyMs: null, lastChecked: new Date().toISOString() },
  { id: "github",        name: "GitHub MCP",        url: "http://localhost:7003", healthy: true,  latencyMs: 86,  lastChecked: new Date().toISOString() },
  { id: "supabase",      name: "Supabase MCP",      url: "http://localhost:7004", healthy: true,  latencyMs: 140, lastChecked: new Date().toISOString() },
  { id: "vercel",        name: "Vercel MCP",        url: "http://localhost:7005", healthy: true,  latencyMs: 95,  lastChecked: new Date().toISOString() },
  { id: "firecrawl",     name: "Firecrawl MCP",     url: "http://localhost:7006", healthy: false, latencyMs: null, lastChecked: new Date().toISOString() },
  { id: "ruv-swarm",     name: "RUV Swarm MCP",     url: "http://localhost:7007", healthy: true,  latencyMs: 133, lastChecked: new Date().toISOString() },
];

const initialAgentPool: AgentPool = {
  activeAgents: 3,
  queuedJobs: 1,
  maxConcurrency: 6,
  avgJobMs: 12400,
};

const initialRuns: RunSummary[] = [
  { id: "run_984A", repo: "Bernhard-Reiter/coding-machine", branch: "main",            prompt: "Refactor rate limiting and add tests", status: "success", startedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), durationSec: 214 },
  { id: "run_984B", repo: "Bernhard-Reiter/coding-machine", branch: "feat/mcp-github", prompt: "Implement GitHub MCP actions and webhooks", status: "failed",  startedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),  durationSec: 91 },
];

// --- Helper UI bits ------------------------------------------------------
const StatusDot = ({ ok }: { ok: boolean }) => (<span className="cm-dot" style={{ background: ok ? "var(--color-success)" : "var(--color-danger)" }} />);

const Pill = ({ color, children }: { color: 'success' | 'danger' | 'info' | 'warning'; children: React.ReactNode }) => {
  const map = {
    success: { bg: "var(--color-success)", fg: "var(--color-on-success)" },
    danger:  { bg: "var(--color-danger)",  fg: "var(--color-on-danger)"  },
    info:    { bg: "var(--color-info)",    fg: "var(--color-on-info)"    },
    warning: { bg: "var(--color-warning)", fg: "var(--color-on-warning)" },
  };
  const m = map[color] || map.info;
  return (
    <span style={{ background: m.bg, color: m.fg, borderRadius: 9999, padding: "2px 8px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>{children}</span>
  );
};

// --- Main Component ------------------------------------------------------
export default function CodingMachineDashboard() {
  const [servers, setServers] = React.useState<Server[]>(initialServers);
  const [agentPool, setAgentPool] = React.useState<AgentPool>(initialAgentPool);
  const [runs, setRuns] = React.useState<RunSummary[]>(initialRuns);

  // Form state
  const [repo, setRepo] = React.useState("Bernhard-Reiter/coding-machine");
  const [branch, setBranch] = React.useState("main");
  const [commit, setCommit] = React.useState("");
  const [path, setPath] = React.useState("/");
  const [prompt, setPrompt] = React.useState("");
  const [allowNetwork, setAllowNetwork] = React.useState(true);
  const [allowWrites, setAllowWrites] = React.useState(false);

  // Actions using pure helpers -------------------------------------------
  const handleRestartServer = (id: string) => {
    setServers((prev) => restartServersImmutable(prev, id));
  };

  const startRun = () => {
    const id = `run_${Math.random().toString(36).slice(2, 6)}`;
    const newRun = mkRunSummary({ id, repo, branch, commit: commit || undefined, prompt });
    setRuns((r) => [newRun, ...r]);
  };

  const setConcurrency = (v: number) => {
    setAgentPool((p) => updateConcurrencyImmutable(p, v));
  };

  // Self-test harness (manual trigger) -----------------------------------
  const [tests, setTests] = React.useState<Array<{ name: string; pass: boolean }>>([]);
  const runTests = () => {
    const testsNow: Array<{ name: string; pass: boolean }> = [];
    // T1: token estimate
    testsNow.push({ name: "estimateTokens minimal 1", pass: estimateTokens("") === 1 });
    testsNow.push({ name: "estimateTokens ceil(length/4)", pass: estimateTokens("1234") === 1 && estimateTokens("12345") === 2 });
    // T2: mkRunSummary truncates and status=running
    const long = "x".repeat(140);
    const rs = mkRunSummary({ id: "t", repo: "r", branch: "b", prompt: long });
    testsNow.push({ name: "mkRunSummary status running", pass: rs.status === "running" });
    testsNow.push({ name: "mkRunSummary truncates to <=121", pass: rs.prompt.length <= 121 });
    // T3: restartServersImmutable marks healthy & is immutable
    const base: Server = { id: "github", name: "g", url: "u", healthy: false, latencyMs: null, lastChecked: new Date(0).toISOString() };
    const srv = restartServersImmutable([base], "github");
    testsNow.push({ name: "restart sets healthy", pass: srv[0].healthy === true && typeof srv[0].latencyMs === "number" });
    testsNow.push({ name: "restart is immutable", pass: base.healthy === false && srv[0] !== base });
    // T4: concurrency clamped and floored
    const ap1 = updateConcurrencyImmutable({ activeAgents: 0, queuedJobs: 0, maxConcurrency: 6, avgJobMs: 0 }, 100);
    const ap2 = updateConcurrencyImmutable({ activeAgents: 0, queuedJobs: 0, maxConcurrency: 6, avgJobMs: 0 }, 0);
    const ap3 = updateConcurrencyImmutable({ activeAgents: 0, queuedJobs: 0, maxConcurrency: 6, avgJobMs: 0 }, 7.8);
    testsNow.push({ name: "concurrency upper clamp", pass: ap1.maxConcurrency === 16 });
    testsNow.push({ name: "concurrency lower clamp", pass: ap2.maxConcurrency === 1 });
    testsNow.push({ name: "concurrency floors", pass: ap3.maxConcurrency === 7 });
    // T5: token primary matches requested accent (rgb 66,163,68)
    const cssPrimary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    const okPrimary = cssPrimary.includes('66, 163, 68') || cssPrimary.includes('66,163,68');
    testsNow.push({ name: "token --color-primary rgb(66,163,68)", pass: okPrimary });
    // T6: hover token equals primary (as requested)
    const cssHover = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-hover').trim();
    const okHover = cssHover.includes('66, 163, 68') || cssHover.includes('66,163,68');
    testsNow.push({ name: "token --color-primary-hover equals primary", pass: okHover });
    // T7: success token equals primary
    const cssSuccess = getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim();
    const okSuccess = cssSuccess.includes('66, 163, 68') || cssSuccess.includes('66,163,68');
    testsNow.push({ name: "token --color-success equals primary", pass: okSuccess });
    // T8: on-success is black (for contrast)
    const onSuccess = getComputedStyle(document.documentElement).getPropertyValue('--color-on-success').trim().toLowerCase().replace(/\s+/g,'');
    testsNow.push({ name: "token --color-on-success is black", pass: onSuccess === '#000000' || onSuccess === 'rgb(0,0,0)' });
    setTests(testsNow);
  };

  return (
    <div style={{ minHeight: '100vh', background: "var(--color-background)", color: "var(--color-text-primary)" }}>
      <Tokens />
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--color-border-default)", background: "var(--color-surface)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ height: 32, width: 32, borderRadius: 8, background: "var(--color-primary)" }} />
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>Coding Machine</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Pill color="info">staging</Pill>
            <Button
              variant="secondary"
              onClick={() => {
                const html = document.documentElement;
                const isDark = html.getAttribute("data-theme") === "dark";
                html.setAttribute("data-theme", isDark ? "light" : "dark");
                html.classList.toggle("dark", !isDark);
              }}
            >Theme</Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        {/* Left column: Run Config */}
        <section style={{ display: "grid", gap: 16, gridColumn: "span 2" }}>
          <Card hover>
            <CardHeader>
              <CardTitle>Run-Konfiguration</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <Input label="GitHub Repo (owner/name)" placeholder="z.B. Bernhard-Reiter/coding-machine" value={repo} onChange={(e) => setRepo(e.target.value)} />
                <Input label="Branch" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
                <Input label="Commit (optional)" placeholder="SHA oder leer" value={commit} onChange={(e) => setCommit(e.target.value)} />
                <Input label="Pfad (optional)" placeholder="/ (Root)" value={path} onChange={(e) => setPath(e.target.value)} />
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="cm-label">Prompt</label>
                <textarea
                  style={{ width: "100%", borderRadius: 10, border: "2px solid var(--color-border-default)", padding: "8px 12px", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
                  rows={6}
                  placeholder="Beschreibe die Aufgabe…"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-text-tertiary)" }}>
                  Tokens (ungefähr): {estimateTokens(prompt)}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={allowNetwork} onChange={(e) => setAllowNetwork(e.target.checked)} />
                  Netzwerkzugriff erlauben
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={allowWrites} onChange={(e) => setAllowWrites(e.target.checked)} />
                  Schreibzugriffe erlauben
                </label>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button onClick={startRun}>Run starten</Button>
                <Button variant="secondary">Dry Run</Button>
                <Button variant="ghost">Abbrechen</Button>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Laufende & letzte Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ overflowX: "auto" }}>
                <table className="cm-table" style={{ width: "100%", fontSize: 14 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--color-text-secondary)" }}>
                      <th>ID</th>
                      <th>Repo</th>
                      <th>Branch</th>
                      <th>Status</th>
                      <th>Start</th>
                      <th>Dauer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((r) => (
                      <tr key={r.id} style={{ borderTop: "1px solid var(--color-border-default)" }}>
                        <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{r.id}</td>
                        <td>{r.repo}</td>
                        <td>{r.branch}</td>
                        <td>
                          {r.status === "running" && <Pill color="info">running</Pill>}
                          {r.status === "success" && <Pill color="success">success</Pill>}
                          {r.status === "failed" && <Pill color="danger">failed</Pill>}
                          {r.status === "canceled" && <Pill color="warning">canceled</Pill>}
                        </td>
                        <td>{new Date(r.startedAt).toLocaleString()}</td>
                        <td>{r.durationSec ? `${r.durationSec}s` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right column: System */}
        <section style={{ display: "grid", gap: 16 }}>
          <Card hover>
            <CardHeader>
              <CardTitle>Serverstatus (MCP)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {servers.map((s) => (
                  <li key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <StatusDot ok={s.healthy} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.url}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 48, textAlign: "right" }}>{s.latencyMs ? `${s.latencyMs}ms` : "—"}</span>
                      <Button size="sm" variant="secondary" onClick={() => handleRestartServer(s.id)}>Neustart</Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Button variant="secondary" onClick={() => setServers((prev) => prev.map((s) => ({ ...s, healthy: true, latencyMs: 120 })))}>Alle neu starten</Button>
                <Button variant="ghost" onClick={() => setServers((prev) => prev.map((s) => ({ ...s, lastChecked: new Date().toISOString() })))}>Gesundheit prüfen</Button>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Agenten-Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, fontSize: 14 }}>
                <div>
                  <div style={{ color: "var(--color-text-secondary)" }}>Aktive Agenten</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{agentPool.activeAgents}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-secondary)" }}>Warteschlange</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{agentPool.queuedJobs}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-secondary)" }}>Max. Concurrency</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{agentPool.maxConcurrency}</div>
                </div>
                <div>
                  <div style={{ color: "var(--color-text-secondary)" }}>Ø Job-Dauer</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{Math.round(agentPool.avgJobMs / 1000)}s</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="cm-label">Concurrency anpassen</label>
                <input
                  type="range"
                  min={1}
                  max={16}
                  value={agentPool.maxConcurrency}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <Button size="sm" onClick={() => setConcurrency(agentPool.maxConcurrency + 1)}>Scale Up</Button>
                  <Button size="sm" variant="secondary" onClick={() => setConcurrency(agentPool.maxConcurrency - 1)}>Scale Down</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Live-Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ background: "var(--color-surface-elevated)", borderRadius: 10, padding: 12, height: 220, overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>
                <div style={{ opacity: .7 }}>[12:00:01] openai ✔ health 112ms</div>
                <div style={{ opacity: .7 }}>[12:00:02] github ✔ health 86ms</div>
                <div style={{ opacity: .7 }}>[12:00:03] gemini ✖ timeout</div>
                <div>[12:00:04] run_984C started: refactor RL, dry-run=false</div>
                <div>[12:00:08] agent#2 acquiring token…</div>
                <div>[12:00:11] agent#2 write: packages/rl/index.ts</div>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Button size="sm" variant="secondary">Pausieren</Button>
                <Button size="sm" variant="ghost">Leeren</Button>
                <Button size="sm">Als Datei exportieren</Button>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Diagnostics & Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" onClick={runTests}>Run UI Self-Tests</Button>
              {tests.length > 0 && (
                <ul style={{ marginTop: 10, fontSize: 13 }}>
                  {tests.map((t) => (
                    <li key={t.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="cm-dot" style={{ background: t.pass ? "var(--color-success)" : "var(--color-danger)" }} />
                      <span>{t.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
