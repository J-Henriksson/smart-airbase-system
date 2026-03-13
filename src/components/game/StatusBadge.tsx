import { AircraftStatus, ScenarioPhase } from "@/types/game";

const statusConfig: Record<AircraftStatus, { label: string; bg: string; color: string; border: string; dot: string }> = {
  mission_capable: {
    label: "MC",
    bg: "hsl(152 60% 32% / 0.10)",
    color: "hsl(152 60% 28%)",
    border: "hsl(152 60% 32% / 0.35)",
    dot: "hsl(152 60% 38%)",
  },
  not_mission_capable: {
    label: "NMC",
    bg: "hsl(353 74% 47% / 0.10)",
    color: "hsl(353 74% 40%)",
    border: "hsl(353 74% 47% / 0.35)",
    dot: "hsl(353 74% 47%)",
  },
  on_mission: {
    label: "UPPDRAG",
    bg: "hsl(220 63% 38% / 0.10)",
    color: "hsl(220 63% 34%)",
    border: "hsl(220 63% 38% / 0.35)",
    dot: "hsl(220 63% 50%)",
  },
  maintenance: {
    label: "UH",
    bg: "hsl(42 64% 53% / 0.10)",
    color: "hsl(42 64% 36%)",
    border: "hsl(42 64% 53% / 0.35)",
    dot: "hsl(42 64% 53%)",
  },
};

const phaseConfig: Record<ScenarioPhase, { label: string; bg: string; color: string; border: string; pulse?: boolean }> = {
  FRED: {
    label: "FRED",
    bg: "hsl(152 60% 32% / 0.12)",
    color: "hsl(152 60% 32%)",
    border: "hsl(152 60% 32% / 0.4)",
  },
  KRIS: {
    label: "KRIS",
    bg: "hsl(42 64% 53% / 0.12)",
    color: "hsl(42 64% 36%)",
    border: "hsl(42 64% 53% / 0.4)",
    pulse: true,
  },
  KRIG: {
    label: "⚠ KRIG",
    bg: "hsl(353 74% 47% / 0.12)",
    color: "hsl(353 74% 42%)",
    border: "hsl(353 74% 47% / 0.5)",
    pulse: true,
  },
};

export function AircraftStatusBadge({ status }: { status: AircraftStatus }) {
  const c = statusConfig[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

export function PhaseBadge({ phase }: { phase: ScenarioPhase }) {
  const c = phaseConfig[phase];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-black rounded-full tracking-widest ${c.pulse ? "animate-pulse" : ""}`}
      style={{
        background: c.bg,
        color: c.color,
        border: `1.5px solid ${c.border}`,
        letterSpacing: "0.15em",
      }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}
