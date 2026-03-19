import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import type { AARActionType, RiskLevel } from "../types/game";

// ─── Color helpers ────────────────────────────────────────────────────────────

const DEEP_BLUE  = "#0C234C";
const SILVER     = "#D7DEE1";
const RED        = "#D9192E";
const AMBER      = "#D7AB3A";

function borderColorForRisk(risk?: RiskLevel): string {
  if (risk === "catastrophic" || risk === "high") return RED;
  if (risk === "medium") return "#f59e0b";
  return "#22c55e";
}

function dotColorForRisk(risk?: RiskLevel): string {
  if (risk === "catastrophic" || risk === "high") return RED;
  if (risk === "medium") return "#f59e0b";
  return "#22c55e";
}

const ACTION_BADGES: Record<AARActionType, { label: string; color: string; bg: string }> = {
  MISSION_DISPATCH:  { label: "UPPDRAG",    color: "#60a5fa", bg: "rgba(59,130,246,0.18)" },
  MAINTENANCE_START: { label: "UNDERHÅLL",  color: "#a78bfa", bg: "rgba(139,92,246,0.18)" },
  MAINTENANCE_PAUSE: { label: "PAUSE",      color: AMBER,     bg: "rgba(215,171,58,0.18)" },
  UTFALL_APPLIED:    { label: "UTFALL",     color: "#fb923c", bg: "rgba(249,115,22,0.18)" },
  FAULT_NMC:         { label: "NMC",        color: RED,       bg: "rgba(217,25,46,0.18)"  },
  LANDING_RECEIVED:  { label: "LANDNING",   color: "#22c55e", bg: "rgba(34,197,94,0.18)"  },
  SPARE_PART_USED:   { label: "RESERVDEL",  color: "#22d3ee", bg: "rgba(34,211,238,0.18)" },
  HANGAR_CONFIRM:    { label: "HANGAR",     color: "#a78bfa", bg: "rgba(139,92,246,0.18)" },
};

const RISK_FILTER_MAP: Record<string, RiskLevel> = {
  "Låg":          "low",
  "Medium":       "medium",
  "Hög":          "high",
  "Katastrofalt": "catastrophic",
};

const TYPE_FILTER_MAP: Record<string, AARActionType> = {
  "Uppdrag":   "MISSION_DISPATCH",
  "Underhåll": "MAINTENANCE_START",
  "Pause":     "MAINTENANCE_PAUSE",
  "Utfall":    "UTFALL_APPLIED",
  "NMC":       "FAULT_NMC",
  "Landning":  "LANDING_RECEIVED",
  "Reservdel": "SPARE_PART_USED",
};

// ─── FilterPill ───────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border transition-all"
      style={{
        background: active ? AMBER : "rgba(255,255,255,0.05)",
        color:      active ? DEEP_BLUE : SILVER,
        borderColor: active ? AMBER : "rgba(215,222,225,0.15)",
      }}
    >
      {label}
    </button>
  );
}

// ─── HealthBar ────────────────────────────────────────────────────────────────

function HealthBar({ value }: { value: number }) {
  const color = value < 30 ? RED : value < 60 ? "#f59e0b" : "#22c55e";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(215,222,225,0.45)" }}>
          Hälsa vid beslut
        </span>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: ReturnType<typeof useGame>["state"]["events"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const borderColor = borderColorForRisk(event.riskLevel);
  const isCatastrophic = event.riskLevel === "catastrophic";
  const badge = event.actionType ? ACTION_BADGES[event.actionType] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl overflow-hidden cursor-pointer transition-colors"
      style={{
        borderLeft: `4px solid ${borderColor}`,
        background: expanded ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeftWidth: 4,
        borderLeftColor: borderColor,
      }}
      onClick={() => setExpanded((v) => !v)}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="p-4 space-y-2">
        {/* Catastrophic badge */}
        {isCatastrophic && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-black"
            style={{ background: "rgba(217,25,46,0.22)", color: RED, border: `1px solid ${RED}` }}
          >
            KATASTROFALT FEL
          </motion.div>
        )}

        {/* Row 1 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-mono" style={{ color: "rgba(215,222,225,0.45)", fontFamily: "monospace" }}>
            {event.timestamp}
          </span>
          {event.aircraftId && (
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded"
              style={{ background: DEEP_BLUE, color: AMBER, border: `1px solid rgba(215,171,58,0.3)` }}>
              {event.aircraftId}
            </span>
          )}
          {badge && (
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded"
              style={{ background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          )}
        </div>

        {/* Row 2 — message */}
        <p className="text-[11px] font-mono leading-relaxed" style={{ color: SILVER }}>
          {event.message}
        </p>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-2 border-t space-y-3" style={{ borderColor: "rgba(215,222,225,0.08)" }}>
                {event.healthAtDecision != null && (
                  <HealthBar value={event.healthAtDecision} />
                )}
                {event.resourceImpact && (
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest"
                      style={{ color: "rgba(215,222,225,0.45)" }}>Resursåtgång — </span>
                    <span className="text-[10px] font-mono" style={{ color: SILVER }}>{event.resourceImpact}</span>
                  </div>
                )}
                {event.decisionContext && (
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest"
                      style={{ color: "rgba(215,222,225,0.45)" }}>Beslutskontext — </span>
                    <span className="text-[10px] font-mono italic" style={{ color: "rgba(215,222,225,0.75)" }}>{event.decisionContext}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── BarRow ───────────────────────────────────────────────────────────────────

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono" style={{ color: "rgba(215,222,225,0.6)" }}>{label}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─── Main AARPage ─────────────────────────────────────────────────────────────

export default function AARPage() {
  const { state } = useGame();
  const navigate  = useNavigate();

  const [acFilter,   setAcFilter]   = useState<string>("Alla");
  const [riskFilter, setRiskFilter] = useState<string>("Alla");
  const [typeFilter, setTypeFilter] = useState<string>("Alla");

  // Unique aircraft IDs
  const uniqueAcIds = Array.from(
    new Set(state.events.map((e) => e.aircraftId).filter(Boolean) as string[])
  ).sort();

  // Filter
  const filteredEvents = state.events.filter((e) => {
    if (acFilter !== "Alla" && e.aircraftId !== acFilter) return false;
    if (riskFilter !== "Alla") {
      if (e.riskLevel !== RISK_FILTER_MAP[riskFilter]) return false;
    }
    if (typeFilter !== "Alla") {
      if (e.actionType !== TYPE_FILTER_MAP[typeFilter]) return false;
    }
    return true;
  }).reverse(); // newest first

  // Summary stats (over ALL events, not filtered)
  const total         = state.events.length;
  const missionEvents = state.events.filter((e) => e.actionType === "MISSION_DISPATCH").length;
  const maintEvents   = state.events.filter((e) =>
    e.actionType === "MAINTENANCE_START" || e.actionType === "HANGAR_CONFIRM"
  ).length;
  const otherEvents   = total - missionEvents - maintEvents;

  const lowCount          = state.events.filter((e) => e.riskLevel === "low").length;
  const mediumCount       = state.events.filter((e) => e.riskLevel === "medium").length;
  const highCount         = state.events.filter((e) => e.riskLevel === "high").length;
  const catastrophicCount = state.events.filter((e) => e.riskLevel === "catastrophic").length;

  const riskScore = (mediumCount + highCount * 2 + catastrophicCount * 4) / Math.max(total, 1);
  const profile =
    riskScore > 1.5 ? "Aggressiv / Riskvillig"
    : riskScore > 0.5 ? "Balanserad"
    : "Konservativ / Säkerhetsfokuserad";

  const pauseCount = state.events.filter((e) => e.actionType === "MAINTENANCE_PAUSE").length;

  const currentBase = state.bases[0];
  const headerTimestamp = `Dag ${state.day} ${String(state.hour).padStart(2, "0")}:00Z`;

  return (
    <div className="min-h-screen font-mono flex flex-col" style={{ background: DEEP_BLUE, color: SILVER }}>

      {/* ── HEADER ── */}
      <header className="px-6 py-5 border-b" style={{ borderColor: "rgba(215,222,225,0.1)", background: "rgba(0,0,0,0.25)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(215,222,225,0.4)" }}>
              Black Box — After Action Review
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: SILVER }}>
              AAR — UPPDRAGSANALYS & HISTORIK
            </h1>
            <div className="text-[11px] font-mono mt-1" style={{ color: "rgba(215,222,225,0.5)" }}>
              {currentBase?.name ?? "MOB"} · {headerTimestamp}
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-[10px] font-mono font-bold px-4 py-2 rounded-lg border transition-all hover:brightness-110"
            style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(215,222,225,0.18)", color: SILVER }}
          >
            TILLBAKA →
          </button>
        </div>
      </header>

      {/* ── FILTER BAR ── */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(215,222,225,0.08)", background: "rgba(0,0,0,0.15)" }}>
        <div className="max-w-7xl mx-auto space-y-2.5">
          {/* Row 1 — Aircraft filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono uppercase tracking-widest mr-1" style={{ color: "rgba(215,222,225,0.35)" }}>Plan:</span>
            <FilterPill label="Alla" active={acFilter === "Alla"} onClick={() => setAcFilter("Alla")} />
            {uniqueAcIds.map((id) => (
              <FilterPill key={id} label={id} active={acFilter === id} onClick={() => setAcFilter(id)} />
            ))}
          </div>

          {/* Row 2 — Risk filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono uppercase tracking-widest mr-1" style={{ color: "rgba(215,222,225,0.35)" }}>Risk:</span>
            {["Alla", "Låg", "Medium", "Hög", "Katastrofalt"].map((r) => (
              <FilterPill key={r} label={r} active={riskFilter === r} onClick={() => setRiskFilter(r)} />
            ))}
          </div>

          {/* Row 3 — Type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-mono uppercase tracking-widest mr-1" style={{ color: "rgba(215,222,225,0.35)" }}>Typ:</span>
            {["Alla", "Uppdrag", "Underhåll", "Pause", "Utfall", "NMC", "Landning", "Reservdel"].map((t) => (
              <FilterPill key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY — 60/40 split ── */}
      <div className="flex-1 flex gap-0 max-w-7xl mx-auto w-full px-6 py-6 gap-6">

        {/* ── LEFT — Timeline (60%) ── */}
        <div className="flex-[3] overflow-y-auto space-y-3 pr-2" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </AnimatePresence>
          {filteredEvents.length === 0 && (
            <div className="text-center py-16 text-[11px] font-mono" style={{ color: "rgba(215,222,225,0.3)" }}>
              Inga händelser matchar valt filter.
            </div>
          )}

          {/* Event count */}
          <div className="text-center pt-4 text-[9px] font-mono" style={{ color: "rgba(215,222,225,0.3)" }}>
            Visar {filteredEvents.length} av {total} händelser
          </div>
        </div>

        {/* ── RIGHT — Summary (40%) — sticky ── */}
        <div className="flex-[2] space-y-4" style={{ alignSelf: "flex-start", position: "sticky", top: 16 }}>

          {/* 1. NYTTJANDEGRAD */}
          <div className="rounded-xl p-5 space-y-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(215,222,225,0.1)" }}>
            <div className="text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: "rgba(215,222,225,0.45)" }}>
              NYTTJANDEGRAD
            </div>
            <BarRow label="I luften"   value={missionEvents} max={total} color="#3b82f6" />
            <BarRow label="Underhåll"  value={maintEvents}   max={total} color={AMBER}   />
            <BarRow label="Övrigt"     value={otherEvents}   max={total} color="rgba(215,222,225,0.4)" />
          </div>

          {/* 2. RISKPROFIL */}
          <div className="rounded-xl p-5 space-y-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(215,222,225,0.1)" }}>
            <div className="text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: "rgba(215,222,225,0.45)" }}>
              RISKPROFIL
            </div>
            <div className="text-[12px] font-mono font-bold" style={{
              color: riskScore > 1.5 ? RED : riskScore > 0.5 ? AMBER : "#22c55e"
            }}>
              {profile}
            </div>
            <div className="space-y-2">
              {[
                { label: "Låg risk",          count: lowCount,          color: "#22c55e" },
                { label: "Medium risk",        count: mediumCount,       color: "#f59e0b" },
                { label: "Hög risk",           count: highCount,         color: RED       },
                { label: "Katastrofalt",        count: catastrophicCount, color: "#9f1239" },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[10px] font-mono" style={{ color: "rgba(215,222,225,0.6)" }}>{label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. RESURSEFFEKTIVITET */}
          <div className="rounded-xl p-5 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(215,222,225,0.1)" }}>
            <div className="text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: "rgba(215,222,225,0.45)" }}>
              RESURSEFFEKTIVITET
            </div>
            <div className="space-y-2">
              {pauseCount > 0 && (
                <div className="text-[10px] font-mono flex items-start gap-2" style={{ color: AMBER }}>
                  <span className="flex-shrink-0">•</span>
                  Underhåll avbröts {pauseCount} {pauseCount === 1 ? "gång" : "gånger"} — kapacitetsbrist
                </div>
              )}
              {catastrophicCount > 0 && (
                <div className="text-[10px] font-mono flex items-start gap-2" style={{ color: RED }}>
                  <span className="flex-shrink-0">•</span>
                  {catastrophicCount} katastrofala {catastrophicCount === 1 ? "händelse" : "händelser"} — varningar ignorerades
                </div>
              )}
              {pauseCount === 0 && catastrophicCount === 0 && (
                <div className="text-[10px] font-mono flex items-start gap-2" style={{ color: "#22c55e" }}>
                  <span className="flex-shrink-0">•</span>
                  Effektiv resursanvändning — inga kritiska incidenter
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
