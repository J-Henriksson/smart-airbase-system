import { Aircraft } from "@/types/game";
import { Row } from "./StatBox";
import { Plane } from "lucide-react";

export function AircraftDetailPanel({
  aircraft,
  onBack,
}: {
  aircraft: Aircraft;
  onBack: () => void;
}) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    ready: { label: "Mission Capable", cls: "text-status-green bg-status-green/10 border-status-green/40" },
    allocated: { label: "Tilldelad", cls: "text-status-blue bg-status-blue/10 border-status-blue/40" },
    in_preparation: { label: "Klargöring", cls: "text-status-yellow bg-status-yellow/10 border-status-yellow/40" },
    awaiting_launch: { label: "Väntar start", cls: "text-cyan-400 bg-cyan-400/10 border-cyan-400/40" },
    on_mission: { label: "På uppdrag", cls: "text-status-blue bg-status-blue/10 border-status-blue/40" },
    returning: { label: "Retur", cls: "text-purple-400 bg-purple-400/10 border-purple-400/40" },
    recovering: { label: "Mottagning", cls: "text-orange-400 bg-orange-400/10 border-orange-400/40" },
    under_maintenance: { label: "Underhåll pågår", cls: "text-status-yellow bg-status-yellow/10 border-status-yellow/40" },
    unavailable: { label: "Ej operativ (NMC)", cls: "text-status-red bg-status-red/10 border-status-red/40" },
  };
  const s = statusMap[aircraft.status] ?? statusMap.unavailable;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <button
        onClick={onBack}
        className="text-[10px] font-mono text-primary flex items-center gap-1 hover:underline"
      >
        ← Tillbaka till basen
      </button>

      {/* Status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold font-mono ${s.cls}`}>
        <Plane className="h-4 w-4" />
        {s.label}
      </div>

      {/* Details grid */}
      <div className="space-y-2">
        <Row label="Typ" value={aircraft.type} />
        <Row label="Svans #" value={aircraft.tailNumber} />
        <Row label="Bas" value={aircraft.currentBase} />
        <Row label="Flygtid" value={`${aircraft.flightHours} h`} />
        <Row label="Till service" value={`${aircraft.hoursToService} h kvar`} highlight={aircraft.hoursToService < 20} />
        {aircraft.currentMission && (
          <Row label="Aktuellt uppdrag" value={aircraft.currentMission} />
        )}
        {aircraft.payload && (
          <Row label="Lastning" value={aircraft.payload} />
        )}
        {aircraft.maintenanceType && (
          <Row label="Underhållstyp" value={aircraft.maintenanceType.replace(/_/g, " ")} />
        )}
        {aircraft.maintenanceTimeRemaining && (
          <Row
            label="Kvar i underhåll"
            value={`${aircraft.maintenanceTimeRemaining} h`}
            highlight
          />
        )}
      </div>

      {/* Service bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-muted-foreground">Service-intervall</span>
          <span className="text-[10px] font-mono text-foreground">{aircraft.hoursToService}h kvar</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (aircraft.hoursToService / 100) * 100)}%`,
              backgroundColor: aircraft.hoursToService < 20 ? "#ef4444" : aircraft.hoursToService < 40 ? "#eab308" : "#22c55e",
            }}
          />
        </div>
      </div>
    </div>
  );
}
