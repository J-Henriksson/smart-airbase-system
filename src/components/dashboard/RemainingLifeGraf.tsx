import { Base } from "@/types/game";
import { motion } from "framer-motion";

interface RemainingLifeGrafProps {
  base: Base;
}

export function RemainingLifeGraf({ base }: RemainingLifeGrafProps) {
  const sorted = [...base.aircraft].sort((a, b) => a.hoursToService - b.hoursToService);

  const typeAbbr = (type: string) => {
    if (type === "GripenE") return "E";
    if (type === "GripenF_EA") return "F";
    if (type === "GlobalEye") return "GE";
    if (type === "VLO_UCAV") return "UC";
    return "LO";
  };

  return (
    <div className="space-y-2.5">
      {/* Header row */}
      <div className="grid grid-cols-[90px_1fr_56px] gap-2 items-center pb-1"
        style={{ borderBottom: "1px solid hsl(215 14% 88%)" }}>
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "hsl(218 15% 55%)" }}>FLYGPLAN</span>
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "hsl(218 15% 55%)" }}>REMAINING LIFE</span>
        <span className="text-[9px] font-mono uppercase tracking-widest text-right" style={{ color: "hsl(218 15% 55%)" }}>TIMMAR</span>
      </div>
      {sorted.map((ac, i) => {
        const pct = Math.min(100, (ac.hoursToService / 100) * 100);
        const isCritical = ac.hoursToService < 20;
        const isLow = ac.hoursToService < 40;
        const barColor = isCritical
          ? "hsl(353 74% 47%)"
          : isLow
          ? "hsl(42 64% 53%)"
          : "hsl(152 60% 38%)";
        const textColor = isCritical
          ? "hsl(353 74% 42%)"
          : isLow
          ? "hsl(42 64% 38%)"
          : "hsl(220 63% 18%)";

        return (
          <motion.div
            key={ac.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025 }}
            className="grid grid-cols-[90px_1fr_56px] gap-2 items-center group"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "hsl(220 63% 22%)" }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: barColor }} />
              {ac.tailNumber}
              <span className="text-[8px] font-mono px-1 rounded"
                style={{ background: "hsl(216 18% 92%)", color: "hsl(218 15% 55%)" }}>
                {typeAbbr(ac.type)}
              </span>
            </div>
            <div className="relative h-2.5 rounded-full overflow-hidden"
              style={{ background: "hsl(216 18% 90%)" }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.025, ease: "easeOut" }}
                style={{ background: barColor }}
              />
            </div>
            <div className="text-[10px] font-mono font-bold text-right" style={{ color: textColor }}>
              {ac.hoursToService}h
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
