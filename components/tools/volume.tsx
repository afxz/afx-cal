"use client";

import UnitConverter from "@/components/UnitConverter";
import { UNIT_SYSTEMS } from "@/lib/units";

export default function VolumeTool() {
  return <UnitConverter system={UNIT_SYSTEMS.find((s) => s.id === "volume")!} />;
}
