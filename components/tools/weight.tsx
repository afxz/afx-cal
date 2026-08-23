"use client";

import UnitConverter from "@/components/UnitConverter";
import { UNIT_SYSTEMS } from "@/lib/units";

export default function WeightTool() {
  return <UnitConverter system={UNIT_SYSTEMS.find((s) => s.id === "weight")!} />;
}
