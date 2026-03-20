import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import type { RiskLevel, AARActionType } from "../types/game";
import { FlygschemaTidslinje } from "../components/dashboard/FlygschemaTidslinje";
import { RemainingLifeGraf } from "../components/dashboard/RemainingLifeGraf";
import {
  ArrowLeft, Activity, Plane, Wrench, AlertTriangle, ChevronRight, Clock, Shield,
} from "lucide-react";

// ─── SAAB Brand colors ────────────────────────────────────────────────────────
const DEEP_BLUE = "#0C234C";
const SILVER    = "#D7DEE1";
const RED       = "#D9192E";
const AMBER     = "#D7AB3A";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function borderColorForRisk(risk?: RiskLevel): string {
  if (risk === "catastrophic" || risk === "high") return RED;
  if (risk === "medium") return "#f59e0b";
  return "#22c55e";
}

const ACTION_BADGES: Record<AARActionType, { label: string; color: string; bg: string }> = {
  MISSION_DISPATCH:  { label: "UPPDRAG",    color: "#60a5fa", bg: "rgba(59,130,246,0.18)"  },
  MAINTENANCE_START: { label: "UNDERHÅLL",  color: "#a78bfa", bg: "rgba(139,92,246,0.18)"  },
  MAINTENANCE_PAUSE: { label: "PAUSE",      color: AMBER,     bg: "rgba(215,171,58,0.18)"  },
  UTFALL_APPLIED:    { label: "UTFALL",     color: "#fb923c", bg: "rgba(249,115,22,0.18)"  },
  FAULT_NMC:         { label: "NMC",        color: RED,       bg: "rgba(217,25,46,0.18)"   },
  LANDING_RECEIVED:  { label: "LANDNING",   color: "#22c55e", bg: "rgba(34,197,94,0.18)"   },
  SPARE_PART_USED:   { label: "RESERVDEL",  color: "#22d3ee", bg: "rgba(34,211,238,0.18)"  },
  HANGAR_CONFIRM:    { label: "HANGAR",     color: "#a78bfa", bg: "rgba(139,92,246,0.18)"  },
};

// ─── ReadinessScoreBar ────────────────────────────────────────────────────────

interface ReadinessProps {
  readiness: number;
  mcCount: number;
  uhCount: number;
  nmcCount: number;
  totalCount: number;
  avgHealth: number;
  serviceDue: number;
  phase: string;
}

function ReadinessScoreBar({
  readiness, mcCount, uhCount, nmcCount, totalCount, avgHealth, serviceDue, phase,
}: ReadinessProps) {
  const scoreColor =
    readiness >= 70 ? "#22c55e"
    : readiness >= 40 ? AMBER
    : RED;

  const healthColor =
    avgHealth >= 70 ? "#22c55e"
    : avgHealth >= 40 ? AMBER
    : RED;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div
            className="text-[9px] font-mono uppercase tracking-widest mb-1"
            style={{ color: "rgba(215,222,225,0.45)" }}
          >
            FLEET READINESS
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black font-mono" style={{ color: scoreColor }}>
              {readiness}%
            </span>
            <span className="text-sm font-mono" style={{ color: "rgba(215,222,225,0.5)" }}>
              sammanvägd flottberedskap
            </span>
          </div>
        </div>
        <span
          className="text-[9px] font-mono font-bold px-3 py-1 rounded-full"
          style={(() => {
            if (phase === "FRED") {
              return {
                background: "rgba(34,160,90,0.18)",
                border: "1px solid rgba(34,160,90,0.35)",
                color: "#22a05a",
              };
            }
            if (phase === "KRIS") {
              return {
                background: "rgba(215,171,58,0.18)",
                border: "1px solid rgba(215,171,58,0.35)",
                color: AMBER,
              };
            }
            return {
              background: "rgba(217,25,46,0.15)",
              border: "1px solid rgba(217,25,46,0.3)",
              color: RED,
            };
          })()}
        >
          {phase}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${readiness}%` }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          style={{ background: scoreColor }}
        />
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        {/* MC */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold"
          style={{ background: "rgba(37,99,235,0.18)", border: "1px solid rgba(37,99,235,0.35)", color: "#60a5fa" }}
        >
          <Plane className="h-3 w-3" />
          MC: {mcCount}/{totalCount}
        </div>
        {/* UH */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold"
          style={{ background: "rgba(215,171,58,0.15)", border: "1px solid rgba(215,171,58,0.3)", color: AMBER }}
        >
          <Wrench className="h-3 w-3" />
          UH: {uhCount}
        </div>
        {/* NMC */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold"
          style={{ background: "rgba(217,25,46,0.15)", border: "1px solid rgba(217,25,46,0.3)", color: RED }}
        >
          <AlertTriangle className="h-3 w-3" />
          NMC: {nmcCount}
        </div>
        {/* Avg Health */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold"
          style={{
            background: `${healthColor}18`,
            border: `1px solid ${healthColor}40`,
            color: healthColor,
          }}
        >
          <Shield className="h-3 w-3" />
          Snittshälsa: {avgHealth}%
        </div>
        {/* Service Due */}
        {serviceDue > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold"
            style={{
              background: serviceDue >= 3 ? "rgba(217,25,46,0.15)" : "rgba(215,171,58,0.15)",
              border: `1px solid ${serviceDue >= 3 ? "rgba(217,25,46,0.3)" : "rgba(215,171,58,0.3)"}`,
              color: serviceDue >= 3 ? RED : AMBER,
            }}
          >
            <Clock className="h-3 w-3" />
            Service inom 20h: {serviceDue}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BeslutloggPanel ──────────────────────────────────────────────────────────

interface BeslutloggProps {
  events: ReturnType<typeof useGame>["state"]["events"];
  navigate: ReturnType<typeof useNavigate>;
}

function BeslutloggPanel({ events, navigate }: BeslutloggProps) {
  const filtered = events.filter((e) => e.actionType != null).slice(0, 5);

  return (
    <div
      className="rounded-xl p-4 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="mb-3">
        <div
          className="text-[9px] font-mono uppercase tracking-widest font-bold"
          style={{ color: "rgba(215,222,225,0.45)" }}
        >
          BESLUTSLOGG
        </div>
        <div className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(215,222,225,0.3)" }}>
          Händelser som påverkar flottans hälsa
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="flex-1 flex items-center justify-center text-[10px] font-mono text-center px-4"
          style={{ color: "rgba(215,222,225,0.35)" }}
        >
          Inga händelser loggade ännu — börja flyga plan för att fylla loggen.
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          <AnimatePresence>
            {filtered.map((ev) => {
              const borderColor = borderColorForRisk(ev.riskLevel);
              const badge = ev.actionType ? ACTION_BADGES[ev.actionType] : null;
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg overflow-hidden"
                  style={{
                    borderLeft: `3px solid ${borderColor}`,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="px-3 py-2 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[8px] font-mono"
                        style={{ color: "rgba(215,222,225,0.4)" }}
                      >
                        {ev.timestamp}
                      </span>
                      {ev.aircraftId && (
                        <span
                          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{ background: DEEP_BLUE, color: AMBER, border: `1px solid rgba(215,171,58,0.3)` }}
                        >
                          {ev.aircraftId}
                        </span>
                      )}
                      {badge && (
                        <span
                          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[10px] font-mono leading-tight truncate"
                      style={{ color: SILVER }}
                      title={ev.message}
                    >
                      {ev.message}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={() => navigate("/aar")}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-mono font-bold transition-all hover:brightness-110"
        style={{
          background: "rgba(215,171,58,0.12)",
          border: `1px solid rgba(215,171,58,0.3)`,
          color: AMBER,
        }}
      >
        Visa full AAR
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Main FleetAnalyticsPage ──────────────────────────────────────────────────

export default function FleetAnalyticsPage({ embedded = false }: { embedded?: boolean }) {
  const { state } = useGame();
  const navigate  = useNavigate();
  const [selectedBaseId, setSelectedBaseId] = useState<string>(state.bases[0]?.id ?? "MOB");

  // Gather all aircraft across all bases
  const allAircraft = state.bases.flatMap((base) =>
    base.aircraft.map((ac) => ({ ...ac, baseName: base.name }))
  );

  // Fleet readiness calculation
  const mcCount = allAircraft.filter(
    (ac) =>
      ac.status === "ready" ||
      ac.status === "allocated" ||
      ac.status === "in_preparation" ||
      ac.status === "awaiting_launch"
  ).length;
  const uhCount    = allAircraft.filter((ac) => ac.status === "under_maintenance").length;
  const nmcCount   = allAircraft.filter((ac) => ac.status === "unavailable").length;
  const totalCount = allAircraft.length || 1;
  const avgHealth  = Math.round(
    allAircraft.reduce((s, ac) => s + (ac.health ?? 100), 0) / totalCount
  );
  const readiness  = Math.round((mcCount / totalCount) * 60 + avgHealth * 0.4);
  const serviceDue = allAircraft.filter(
    (ac) =>
      ac.hoursToService < 20 &&
      (ac.status === "ready" || ac.status === "allocated")
  ).length;

  return (
    <div className={embedded ? "font-mono min-h-full" : "min-h-screen font-mono"} style={{ background: DEEP_BLUE, color: SILVER }}>

      {/* Header — only in standalone mode */}
      {!embedded && (
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(215,222,225,0.1)" }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-xs font-mono hover:opacity-70 transition-opacity"
              style={{ color: "rgba(215,222,225,0.6)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              DASHBOARD
            </button>
            <div className="h-4 w-px" style={{ background: "rgba(215,222,225,0.2)" }} />
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: AMBER }} />
              <span className="text-sm font-mono font-bold tracking-wider" style={{ color: SILVER }}>
                FLEET ANALYTICS — FLOTTÖVERSIKT
              </span>
            </div>
          </div>
          <span className="text-xs font-mono" style={{ color: "rgba(215,222,225,0.5)" }}>
            Dag {state.day} · {String(state.hour).padStart(2, "0")}:00 · {state.phase}
          </span>
        </div>
      )}

      <div className="p-6 space-y-6">

        {/* Fleet Readiness Score */}
        <ReadinessScoreBar
          readiness={readiness}
          mcCount={mcCount}
          uhCount={uhCount}
          nmcCount={nmcCount}
          totalCount={totalCount}
          avgHealth={avgHealth}
          serviceDue={serviceDue}
          phase={state.phase}
        />

        {/* Life Chart + Beslutlogg */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>

          {/* Left — FlygschemaTidslinje with base selector */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Base tabs */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-mono uppercase tracking-widest font-bold mr-2" style={{ color: "rgba(215,222,225,0.45)" }}>
                LIVSLÄNGD &amp; FLYGSCHEMA
              </span>
              {state.bases.map((base) => (
                <button
                  key={base.id}
                  onClick={() => setSelectedBaseId(base.id)}
                  className="px-3 py-1 rounded text-[9px] font-mono font-bold transition-all"
                  style={{
                    background: selectedBaseId === base.id ? AMBER : "rgba(215,222,225,0.08)",
                    color: selectedBaseId === base.id ? DEEP_BLUE : "rgba(215,222,225,0.55)",
                    border: selectedBaseId === base.id ? "none" : "1px solid rgba(215,222,225,0.15)",
                  }}
                >
                  {base.id}
                </button>
              ))}
            </div>

            {/* Chart — light wrapper so FlygschemaTidslinje renders on white bg */}
            <div className="rounded-lg overflow-hidden bg-white p-3">
              {(() => {
                const base = state.bases.find((b) => b.id === selectedBaseId) ?? state.bases[0];
                return (
                  <FlygschemaTidslinje
                    base={base}
                    hour={state.hour}
                    atoOrders={state.atoOrders}
                  />
                );
              })()}
            </div>
          </div>

          <BeslutloggPanel events={state.events} navigate={navigate} />
        </div>

        {/* Per-base life & recommendations — follows the base selector above */}
        {(() => {
          const selectedBase = state.bases.find((b) => b.id === selectedBaseId) ?? state.bases[0];
          return (
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-[9px] font-mono uppercase tracking-widest font-bold" style={{ color: "rgba(215,222,225,0.45)" }}>
                  REMAINING LIFE &amp; OPTIMERINGSREKOMMENDATIONER — {selectedBase.id}
                </div>
                <span className="text-[8px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(215,171,58,0.15)", color: AMBER }}>
                  {selectedBase.aircraft.length} flygplan
                </span>
              </div>
              <div className="rounded-lg overflow-hidden bg-white p-4">
                <RemainingLifeGraf bases={[selectedBase]} phase={state.phase} />
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
